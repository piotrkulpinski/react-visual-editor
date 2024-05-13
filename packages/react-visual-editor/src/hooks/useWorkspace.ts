import { Rect } from "fabric"
import { throttle } from "radash"
import type { EditorHook } from "../types/hook"

type UseWorkspaceProps = EditorHook & {}

export const useWorkspace = ({ enabled, canvas, ...options }: UseWorkspaceProps) => {
  const name = "workspace"

  const init = () => {}

  const initWorkspace = ({
    width,
    height,
    backgroundColor,
  }: { width: number; height: number; backgroundColor: string }) => {
    const workspace = new Rect({
      width,
      height,
      fill: backgroundColor,
      id: "workspace",
    })
    workspace.set("selectable", false)
    workspace.set("hasControls", false)
    workspace.hoverCursor = "default"
    canvas.add(workspace)
    canvas.renderAll()

    if (canvas.clearHistory) {
      canvas.clearHistory()
    }

    zoomAuto()
  }

  // Initialize listeners
  const _initResizeObserve = () => {
    const resizeObserver = new ResizeObserver(throttle({ interval: 50 }, zoomAuto))

    resizeObserver.observe(this.workspaceEl)
  }

  // const setSize = (width: number | undefined, height: number | undefined) => {
  //   this._initBackground()
  //   this.options.width = width
  //   this.options.height = height

  //   // Reset workspace
  //   this.workspace = this.getWorkspace()
  //   this.workspace?.set("width", width)
  //   this.workspace?.set("height", height)
  //   this.editor.emit("sizeChange", width, height)
  //   this.zoomAuto()
  // }

  const _getScale = (): number | undefined => {
    const workspace = this.getWorkspace()

    if (!workspace) return

    const { offsetWidth, offsetHeight } = this.workspaceEl
    const source = { width: workspace.width, height: workspace.height }
    const destination = { width: offsetWidth, height: offsetHeight }

    // FIXME: findScaleToFit is not exported
    return (fabric.util as any).findScaleToFit(source, destination)
  }

  const _bindWheel = () => {
    canvas.on("mouse:wheel", ({ e }) => {
      e.preventDefault()
      e.stopPropagation()

      const delta = e.deltaY
      let zoom = canvas.getZoom() * 0.999 ** delta
      zoom = Math.min(Math.max(zoom, 0.01), 20)

      const { left, top } = canvas.getCenter()
      canvas.zoomToPoint(new fabric.Point(left, top), zoom)
    })
  }

  // Return workspace object
  const getWorkspace = () => {
    return canvas.getObjects().find(({ id }) => id === "workspace")
  }

  /**
   * Center the canvas on the center point of the specified object
   * @param {Object} obj Specified object
   */
  const setCenterFromObject = (obj: fabric.Rect) => {
    const objCenter = obj.getCenterPoint()
    const { width, height, viewportTransform } = canvas

    if (width === undefined || height === undefined || !viewportTransform) {
      return
    }

    viewportTransform[4] = width / 2 - objCenter.x * (viewportTransform[0] ?? 1)
    viewportTransform[5] = height / 2 - objCenter.y * (viewportTransform[3] ?? 1)
    canvas.setViewportTransform(viewportTransform)
    canvas.renderAll()
  }

  const setZoomAuto = (scale: number, cb?: (left?: number, top?: number) => void) => {
    const { left, top } = canvas.getCenter()
    const { offsetWidth, offsetHeight } = workspaceEl

    canvas.setDimensions({ width: offsetWidth, height: offsetHeight })
    canvas.setViewportTransform(fabric.iMatrix.concat())
    canvas.zoomToPoint(new fabric.Point(left, top), scale)

    if (!workspace) return
    setCenterFromObject(workspace)

    // Do not display beyond the canvas
    workspace.clone((cloned: fabric.Rect) => {
      canvas.clipPath = cloned
      canvas.requestRenderAll()
    })

    if (cb) cb(workspace.left, workspace.top)
  }

  // Zoom in
  zoomIn()
  {
    const { left, top } = this.canvas.getCenter()
    let zoomRatio = this.canvas.getZoom()
    zoomRatio += 0.05

    this.canvas.zoomToPoint(new fabric.Point(left, top), zoomRatio)
  }

  // Zoom out
  zoomOut()
  {
    const { left, top } = this.canvas.getCenter()
    let zoomRatio = this.canvas.getZoom()
    zoomRatio -= 0.05

    this.canvas.zoomToPoint(new fabric.Point(left, top), zoomRatio < 0 ? 0.01 : zoomRatio)
  }

  // Auto zoom
  zoomAuto()
  {
    const scale = this._getScale()
    scale && this.setZoomAuto(scale * this.zoomRatio)
  }

  // Zoom to 1:1 scale
  zoomFull()
  this.setZoomAuto(1 * this.zoomRatio)
  this.canvas.requestRenderAll()

  export { init }
}
