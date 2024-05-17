import { fabric } from "fabric"
import type { ZoomOptions } from "../utils/types"
import type Handler from "./Handler"

export const defaultZoomOptions: ZoomOptions = {
  enabled: true,
  minZoom: 0.01,
  maxZoom: 5,
  steps: [0.05, 0.75, 0.125, 0.25, 0.5, 0.75, 1, 1.5, 2, 4],
  fitRatio: 0.8,
}

class ZoomHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler
  }

  // /**
  //  * Zoom at mouse wheel event
  //  */
  // public mousewheel = ({ e }: fabric.IEvent<WheelEvent>) => {
  //   if (!this.handler.zoomOptions.enabled) {
  //     return
  //   }

  //   e.preventDefault()
  //   e.stopPropagation()

  //   const zoom = this.handler.canvas.getZoom()
  //   this.handler.zoomHandler.setZoom(zoom * 0.999 ** e.deltaY, e.layerX, e.layerY)
  // }

  /**
   * Zoom the canvas and trigger the event
   * If x and y are not provided, the center point of the canvas will be used
   *
   * @param zoom The zoom level
   * @param x The x coordinate of the point to zoom to
   * @param y The y coordinate of the point to zoom to
   */
  public setZoom = (zoom: number, ...coords: number[]) => {
    const { minZoom, maxZoom } = this.handler.zoomOptions
    const normalizedZoom = Math.min(Math.max(zoom, minZoom), maxZoom)

    if (coords.length) {
      this.handler.canvas.zoomToPoint(new fabric.Point(coords[0], coords[1]), normalizedZoom)
    } else {
      this.handler.canvas.setZoom(normalizedZoom)
      this.handler.workspace && this.setCenterFromObject(this.handler.workspace)
    }

    // Store the zoom level in the store
    this.handler.store.setState({ zoom: normalizedZoom })
  }

  /**
   * Zoom in the canvas
   */
  public setZoomIn = () => {
    const nearestZoom = this.findNearestZoomLevel("up")
    this.setZoom(nearestZoom)
  }

  /**
   * Zoom out the canvas
   */
  public setZoomOut = () => {
    const nearestZoom = this.findNearestZoomLevel("down")
    this.setZoom(nearestZoom)
  }

  /**
   * Zoom the canvas to fit the workspace
   */
  public setZoomToFit = () => {
    const zoom = this.getScale()
    this.setZoom(zoom * this.handler.zoomOptions.fitRatio)
  }

  /**
   * Finds the nearest zoom level
   *
   * @param dir - The direction to find the nearest zoom level. Can be "up" or "down".
   * @returns The nearest zoom level.
   */
  private findNearestZoomLevel = (dir: "up" | "down") => {
    const zoom = this.handler.canvas.getZoom()
    const zoomSteps = this.handler.zoomOptions.steps

    const steps =
      dir === "up"
        ? zoomSteps.filter(step => step > zoom)
        : zoomSteps.reverse().filter(step => step < zoom)

    return Math[dir === "up" ? "min" : "max"](...steps) || zoom
  }

  /**
   * Get the scale of the canvas
   *
   * @returns The scale of the canvas.
   */
  private getScale = () => {
    const { offsetWidth: width, offsetHeight: height } = this.handler.container

    // FIXME: findScaleToFit is not exported
    return (fabric.util as any).findScaleToFit(this.handler.workspace, { width, height }) as number
  }

  /**
   * Center the canvas on the center point of the specified object
   *
   * @param {fabric.Object} object
   */
  private setCenterFromObject = (object: fabric.Object) => {
    const objCenter = object.getCenterPoint()
    const { width, height, viewportTransform } = this.handler.canvas

    if (width === undefined || height === undefined || !viewportTransform) {
      return
    }

    viewportTransform[4] = width / 2 - objCenter.x * (viewportTransform[0] ?? 1)
    viewportTransform[5] = height / 2 - objCenter.y * (viewportTransform[3] ?? 1)
    this.handler.canvas.setViewportTransform(viewportTransform)
    this.handler.canvas.requestRenderAll()
  }
}

export default ZoomHandler
