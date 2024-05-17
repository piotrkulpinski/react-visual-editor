import { debounce } from "radash"
import { type PropsWithChildren, createContext, useContext, useEffect, useState } from "react"
import { emitter } from "../emitters/EditorEmitter"
import { useEditor } from "./EditorProvider"

export type EditorWorkspaceContext = {
  workspace?: fabric.Rect
  zoom: number
  zoomIn: () => void
  zoomOut: () => void
  zoomToFit: () => void
}

const EditorWorkspaceContext = createContext<EditorWorkspaceContext>({} as EditorWorkspaceContext)

export const EditorWorkspaceProvider = ({ ...props }: PropsWithChildren) => {
  const { canvasRef, canvas } = useEditor()

  const [workspace, setWorkspace] = useState<fabric.Rect>()
  const [zoom, setZoom] = useState(1)

  const zoomRatio = 0.8
  const minZoom = 0.05
  const maxZoom = 16
  const zoomSteps = [0.05, 0.75, 0.125, 0.25, 0.5, 0.75, 1, 1.5, 2, 4, 8, 16]

  useEffect(() => {
    console.log(canvas)
  }, [canvas])

  useEffect(() => {
    setCanvasZoom(zoom)
  }, [zoom])

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
    setWorkspace(workspace)
  }

  /**
   * Zoom the canvas and trigger the event
   * If x and y are not provided, the center point of the canvas will be used
   *
   * @param zoom The zoom level
   * @param x The x coordinate of the point to zoom to
   * @param y The y coordinate of the point to zoom to
   */
  const setCanvasZoom = (zoom: number, ...coords: number[]) => {
    const normalizedZoom = Math.min(Math.max(zoom, minZoom), maxZoom)

    if (coords.length) {
      canvas?.zoomToPoint(new fabric.Point(coords[0], coords[1]), normalizedZoom)
    } else {
      canvas?.setZoom(normalizedZoom)
      _setCenterFromObject(workspace)
    }

    // Update the zoom level
    setZoom(normalizedZoom)
  }

  // Center the canvas on the center point of the specified object
  const _setCenterFromObject = (object?: fabric.Object) => {
    if (!object || !canvas) return

    const objCenter = object.getCenterPoint()
    const { width, height, viewportTransform } = canvas

    if (width === undefined || height === undefined || !viewportTransform) {
      return
    }

    viewportTransform[4] = width / 2 - objCenter.x * (viewportTransform[0] ?? 1)
    viewportTransform[5] = height / 2 - objCenter.y * (viewportTransform[3] ?? 1)
    canvas.setViewportTransform(viewportTransform)
    canvas.renderAll()
  }

  // Find the nearest zoom level
  const _findNearestZoomLevel = (dir: "up" | "down") => {
    const steps =
      dir === "up"
        ? zoomSteps.filter(step => step > zoom)
        : zoomSteps.reverse().filter(step => step < zoom)

    const nearestStep = Math[dir === "up" ? "min" : "max"](...steps)
    return nearestStep || zoom
  }

  const _getScale = () => {
    if (!canvas || !canvasRef?.current) return

    const { offsetWidth: width, offsetHeight: height } = canvasRef.current

    // FIXME: findScaleToFit is not exported
    return (fabric.util as any).findScaleToFit(workspace, { width, height }) as number
  }

  // Zoom in
  const zoomIn = () => {
    const nearestZoom = _findNearestZoomLevel("up")
    setZoom(nearestZoom)
  }

  // Zoom out
  const zoomOut = () => {
    const nearestZoom = _findNearestZoomLevel("down")
    setZoom(nearestZoom)
  }

  // Zoom to fit
  const zoomToFit = () => {
    const zoom = _getScale()
    zoom && setZoom(zoom * zoomRatio)
  }

  const resizeObserver = new ResizeObserver(
    debounce({ delay: 25 }, () => {
      if (!canvasRef?.current) return

      const { offsetWidth, offsetHeight } = canvasRef.current

      // Sometimes the canvas is not ready when the resize event is triggered
      if (!canvas?.lowerCanvasEl) return

      canvas?.setDimensions({ width: offsetWidth, height: offsetHeight })
      canvas?.setViewportTransform(fabric.iMatrix.concat())

      // Zoom the canvas
      zoomToFit()
    }),
  )

  // Add event listener when the canvas is loaded
  emitter.on("editor:load", canvas => {
    createWorkspace(canvas)

    if (canvasRef?.current) {
      resizeObserver.observe(canvasRef.current)
    }

    // Zoom to fit
    zoomToFit()
  })

  // Add event listener when the canvas is destroyed
  emitter.on("editor:destroy", () => {
    if (canvasRef?.current) {
      resizeObserver.disconnect()
    }
  })

  // Start listening to the canvas when it is loaded
  canvas?.on("mouse:wheel", ({ e }) => {
    e.preventDefault()
    e.stopPropagation()

    setZoom(zoom * 0.999 ** e.deltaY)
  })

  return (
    <EditorWorkspaceContext.Provider
      value={{ workspace, zoom, zoomIn, zoomOut, zoomToFit }}
      {...props}
    />
  )
}

export const useEditorWorkspace = () => {
  const context = useContext(EditorWorkspaceContext)

  if (!context) {
    throw new Error("EditorWorkspaceContext is not available")
  }

  return context
}
