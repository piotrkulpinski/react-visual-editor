import { debounce } from "radash"
import { useEffect } from "react"
import type { EditorStore } from "../providers/EditorProvider"

type UseEditorWorkspaceProps = {
  store: EditorStore
  canvas: HTMLDivElement | null
}

export const useEditorWorkspace = ({ store, canvas }: UseEditorWorkspaceProps) => {
  const zoomRatio = 0.8
  const minZoom = 0.05
  const maxZoom = 16
  const zoomSteps = [0.05, 0.75, 0.125, 0.25, 0.5, 0.75, 1, 1.5, 2, 4, 8, 16]

  useEffect(() => {
    setZoom(store.zoom)
  }, [store.zoom])

  const createWorkspace = (canvas: fabric.Canvas) => {
    const workspace = new fabric.Rect({
      id: "workspace",
      width: 1000,
      height: 1000,
      fill: "#B1B6A6",
    })

    workspace.set("selectable", false)
    workspace.set("hasControls", false)
    workspace.hoverCursor = "default"

    canvas.add(workspace)
    canvas.renderAll()

    // Update the workspace
    store.setWorkspace(workspace)
  }

  // Bind events
  store.canvas?.on("mouse:wheel", ({ e }) => {
    e.preventDefault()
    e.stopPropagation()

    store.setZoom(store.zoom * 0.999 ** e.deltaY)
    // setZoom(store.zoom * 0.999 ** e.deltaY, e.layerX, e.layerY)
  })

  /**
   * Zoom the canvas and trigger the event
   * If x and y are not provided, the center point of the canvas will be used
   *
   * @param zoom The zoom level
   * @param x The x coordinate of the point to zoom to
   * @param y The y coordinate of the point to zoom to
   */
  const setZoom = (zoom: number, ...coords: number[]) => {
    const normalizedZoom = Math.min(Math.max(zoom, minZoom), maxZoom)

    if (coords.length) {
      store.canvas?.zoomToPoint(new fabric.Point(coords[0], coords[1]), normalizedZoom)
    } else {
      store.canvas?.setZoom(normalizedZoom)
      _setCenterFromObject(store.workspace)
    }

    // Update the zoom level
    store.setZoom(normalizedZoom)
  }

  const _resizeCanvas = () => {
    console.log(canvas, store.canvas)

    if (!canvas) return

    const { offsetWidth, offsetHeight } = canvas

    // Sometimes the canvas is not ready when the resize event is triggered
    if (!store.canvas?.lowerCanvasEl) return

    store.canvas?.setDimensions({ width: offsetWidth, height: offsetHeight })
    store.canvas?.setViewportTransform(fabric.iMatrix.concat())

    // Zoom the canvas
    zoomToFit()
  }

  // Center the canvas on the center point of the specified object
  const _setCenterFromObject = (object?: fabric.Object) => {
    if (!object || !store.canvas) return

    const objCenter = object.getCenterPoint()
    const { width, height, viewportTransform } = store.canvas

    if (width === undefined || height === undefined || !viewportTransform) {
      return
    }

    viewportTransform[4] = width / 2 - objCenter.x * (viewportTransform[0] ?? 1)
    viewportTransform[5] = height / 2 - objCenter.y * (viewportTransform[3] ?? 1)
    store.canvas.setViewportTransform(viewportTransform)
    store.canvas.renderAll()
  }

  // Find the nearest zoom level
  const _findNearestZoomLevel = (dir: "up" | "down") => {
    const steps =
      dir === "up"
        ? zoomSteps.filter(step => step > store.zoom)
        : zoomSteps.reverse().filter(step => step < store.zoom)

    const nearestStep = Math[dir === "up" ? "min" : "max"](...steps)
    return nearestStep || store.zoom
  }

  const _getScale = () => {
    if (!canvas) return

    const { offsetWidth: width, offsetHeight: height } = canvas

    // FIXME: findScaleToFit is not exported
    return (fabric.util as any).findScaleToFit(store.workspace, { width, height }) as number
  }

  // Zoom in
  const zoomIn = () => {
    const nearestZoom = _findNearestZoomLevel("up")
    store.setZoom(nearestZoom)
  }

  // Zoom out
  const zoomOut = () => {
    const nearestZoom = _findNearestZoomLevel("down")
    store.setZoom(nearestZoom)
  }

  // Zoom to fit
  const zoomToFit = () => {
    const zoom = _getScale()
    zoom && store.setZoom(zoom * zoomRatio)
  }

  const resizeObserver = new ResizeObserver(
    debounce({ delay: 25 }, () => {
      _resizeCanvas
    }),
  )

  resizeObserver.observe(canvas)

  return { createWorkspace, zoomIn, zoomOut, zoomToFit }
}
