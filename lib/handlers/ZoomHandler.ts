import { CanvasEvents, FabricObject, Point, util } from "fabric"
import type Handler from "./Handler"
import { check } from "../utils/check"

class ZoomHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler

    // Register hotkeys
    this.handler.registerHotkeyHandlers(
      { key: "cmd+=", handler: () => this.setZoomIn() },
      { key: "cmd+-", handler: () => this.setZoomOut() },
      { key: "cmd+0", handler: () => this.setZoom(1) },
      { key: "shift+1", handler: () => this.setZoomToFit() },
      { key: "shift+2", handler: () => this.setZoomToSelection() }
    )

    // Register canvas events
    this.handler.canvas.on("mouse:wheel", this.onMouseWheel.bind(this))
  }

  /**
   * Mouse wheel event
   */
  private onMouseWheel({ e }: CanvasEvents["mouse:wheel"]) {
    e.preventDefault()
    e.stopPropagation()

    if (e.metaKey || e.ctrlKey) {
      const multiplier = e.metaKey ? 0.999 : 0.99
      const zoom = this.handler.canvas.getZoom()
      const mousePoint = new Point(e.layerX, e.layerY)

      // Zoom canvas to the mouse point
      this.handler.zoomHandler.setZoom(zoom * multiplier ** e.deltaY, undefined, mousePoint)
    }
  }

  /**
   * Zoom the canvas and trigger the event
   * If x and y are not provided, the center point of the canvas will be used
   *
   * @param zoom The zoom level
   * @param an object to center the zoom on
   * @param x The x coordinate of the point to zoom to
   * @param y The y coordinate of the point to zoom to
   */
  public setZoom(zoom: number, object?: FabricObject, point?: Point) {
    const { minZoom, maxZoom } = this.handler.zoomOptions
    const normalizedZoom = Math.min(Math.max(zoom, minZoom), maxZoom)

    if (point) {
      this.handler.canvas.zoomToPoint(point, normalizedZoom)
    } else {
      this.handler.canvas.setZoom(normalizedZoom)
      this.setCenterFromObject(object ?? this.handler.workspace)
    }

    // Store the zoom level in the store
    this.handler.store.setState({ zoom: normalizedZoom })
    return
  }

  /**
   * Zoom in the canvas
   */
  public setZoomIn() {
    const nearestZoom = this.findNearestZoomLevel("up")
    this.setZoom(nearestZoom)
  }

  /**
   * Zoom out the canvas
   */
  public setZoomOut() {
    const nearestZoom = this.findNearestZoomLevel("down")
    this.setZoom(nearestZoom)
  }

  /**
   * Zoom the canvas to fit the workspace
   */
  public setZoomToFit(limitToOne = false) {
    const workspace = this.handler.workspace
    const zoom = this.getScale(workspace)

    this.setZoom(limitToOne ? Math.min(zoom, 1) : zoom)
  }

  /**
   * Zoom the canvas to fit the active object
   */
  public setZoomToSelection() {
    const activeObject = this.getActiveObject()
    if (!activeObject) return

    const zoom = this.getScale(activeObject)

    this.setZoom(zoom, activeObject)
  }

  /**
   * Get the active object ignoring guide lines
   */
  private getActiveObject() {
    const activeObject = this.handler.canvas.getActiveObject()

    if (!check.isGuideLine(activeObject)) {
      return activeObject
    }
  }

  /**
   * Center the canvas on the center object of the workspace
   *
   * @param object - The object to center the canvas on
   */
  private setCenterFromObject(object: FabricObject) {
    const { x, y } = object.getCenterPoint()
    const { width, height, viewportTransform } = this.handler.canvas

    if (width === undefined || height === undefined || !viewportTransform) {
      return
    }

    viewportTransform[4] = width / 2 - x * (viewportTransform[0] ?? 1)
    viewportTransform[5] = height / 2 - y * (viewportTransform[3] ?? 1)
    this.handler.canvas.setViewportTransform(viewportTransform)
    this.handler.canvas.requestRenderAll()
  }

  /**
   * Finds the nearest zoom level
   *
   * @param dir - The direction to find the nearest zoom level. Can be "up" or "down".
   * @returns The nearest zoom level.
   */
  private findNearestZoomLevel(dir: "up" | "down") {
    const zoom = this.handler.canvas.getZoom()
    const zoomSteps = this.handler.zoomOptions.steps

    const steps =
      dir === "up"
        ? zoomSteps.filter((step) => step > zoom)
        : zoomSteps.reverse().filter((step) => step < zoom)

    return Math[dir === "up" ? "min" : "max"](...steps) || zoom
  }

  /**
   * Get the scale of the canvas
   *
   * @returns The scale of the canvas.
   */
  private getScale({ width, height, scaleX, scaleY }: FabricObject) {
    const { offsetWidth, offsetHeight } = this.handler.container

    const scale = util.findScaleToFit(
      { width: width * scaleX, height: height * scaleY },
      { width: offsetWidth, height: offsetHeight }
    )

    return scale * this.handler.zoomOptions.fitRatio
  }
}

export default ZoomHandler
