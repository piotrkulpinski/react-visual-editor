import { fabric } from "fabric"
import { debounce } from "radash"
import type Editor from "../Editor"
import EditorPlugin from "../EditorPlugin"

type WorkspaceOptions = {
  workspaceEl: HTMLElement
  width: number
  height: number
  backgroundColor: string
}

/**
 * Plugin for managing the workspace, including resizing, zooming, and centering.
 */
class WorkspacePlugin extends EditorPlugin<WorkspaceOptions> {
  static pluginName = "WorkspacePlugin"
  static events = ["sizeChange", "zoomChange"]
  static apis = ["setSize", "setZoom", "zoomIn", "zoomOut", "zoomToFit"]

  private workspaceId = "workspace"

  // Add min and max zoom level variables
  private zoomRatio = 0.8
  private minZoom = 0.05
  private maxZoom = 16
  private zoomSteps = [0.05, 0.75, 0.125, 0.25, 0.5, 0.75, 1, 1.5, 2, 4, 8, 16]

  constructor(canvas: fabric.Canvas, editor: Editor, options: WorkspaceOptions) {
    super(canvas, editor, options)

    this.init()
  }

  init() {
    this._initBackground()
    this._initWorkspace()
    this._initResizeObserve()

    // Bind events
    this.canvas.on("mouse:wheel", ({ e }) => {
      e.preventDefault()
      e.stopPropagation()

      this.setZoom(this.canvas.getZoom() * 0.999 ** e.deltaY, e.layerX, e.layerY)
    })
  }

  hookImportAfter() {
    return new Promise(resolve => {
      if (this.editor.workspace) {
        this.editor.workspace.set("selectable", false)
        this.editor.workspace.set("hasControls", false)
        this.setSize(this.editor.workspace.width ?? 0, this.editor.workspace.height ?? 0)
        this.editor.emit("sizeChange", this.editor.workspace.width, this.editor.workspace.height)
      }

      resolve("")
    })
  }

  hookSaveAfter() {
    return new Promise(resolve => {
      this.zoomToFit()
      resolve(true)
    })
  }

  // Initialize background
  _initBackground() {
    this.canvas.setDimensions({
      width: this.options.workspaceEl.offsetWidth,
      height: this.options.workspaceEl.offsetHeight,
    })
  }

  // Initialize workspace
  _initWorkspace() {
    const { width, height, backgroundColor: fill } = this.options
    const workspace = new fabric.Rect({
      id: this.workspaceId,
      width,
      height,
      fill,
    })

    workspace.set("selectable", false)
    workspace.set("hasControls", false)
    workspace.hoverCursor = "default"

    this.canvas.add(workspace)
    this.canvas.renderAll()
    this.editor.workspace = workspace

    // Do not display beyond the canvas
    // this.editor.workspace.clone((cloned: fabric.Rect) => {
    //   this.canvas.clipPath = cloned
    //   this.canvas.requestRenderAll()
    // })

    if (this.canvas.clearHistory) {
      this.canvas.clearHistory()
    }

    this.zoomToFit()
  }

  // Initialize listeners
  _initResizeObserve() {
    const resizeObserver = new ResizeObserver(
      debounce({ delay: 25 }, this._resizeCanvas.bind(this)),
    )

    resizeObserver.observe(this.options.workspaceEl)
  }

  setSize(width: number, height: number) {
    this._initBackground()
    this.options.width = width
    this.options.height = height

    // Reset workspace
    this.editor.workspace.set("width", width)
    this.editor.workspace.set("height", height)
    this.editor.emit("sizeChange", width, height)
    this.zoomToFit()
  }

  _resizeCanvas() {
    const { offsetWidth, offsetHeight } = this.options.workspaceEl

    // Sometimes the canvas is not ready when the resize event is triggered
    if (!this.canvas.lowerCanvasEl) return

    this.canvas.setDimensions({ width: offsetWidth, height: offsetHeight })
    this.canvas.setViewportTransform(fabric.iMatrix.concat())

    // Zoom the canvas
    this.zoomToFit()
  }

  _getScale() {
    const { offsetWidth: width, offsetHeight: height } = this.options.workspaceEl

    // FIXME: findScaleToFit is not exported
    return (fabric.util as any).findScaleToFit(this.editor.workspace, {
      width,
      height,
    }) as number
  }

  // Center the canvas on the center point of the specified object
  _setCenterFromObject(object?: fabric.Object) {
    if (!object) return

    const objCenter = object.getCenterPoint()
    const { width, height, viewportTransform } = this.canvas

    if (width === undefined || height === undefined || !viewportTransform) {
      return
    }

    viewportTransform[4] = width / 2 - objCenter.x * (viewportTransform[0] ?? 1)
    viewportTransform[5] = height / 2 - objCenter.y * (viewportTransform[3] ?? 1)
    this.canvas.setViewportTransform(viewportTransform)
    this.canvas.renderAll()
  }

  // Find the nearest zoom level
  _findNearestZoomLevel(dir: "up" | "down") {
    const zoom = this.canvas.getZoom()

    const steps =
      dir === "up"
        ? this.zoomSteps.filter(step => step > zoom)
        : this.zoomSteps.reverse().filter(step => step < zoom)

    const nearestStep = Math[dir === "up" ? "min" : "max"](...steps)
    return nearestStep || zoom
  }

  /**
   * Zoom the canvas and trigger the event
   * If x and y are not provided, the center point of the canvas will be used
   *
   * @param zoom The zoom level
   * @param x The x coordinate of the point to zoom to
   * @param y The y coordinate of the point to zoom to
   */
  setZoom(zoom: number, ...coords: number[]) {
    const normalizedZoom = Math.min(Math.max(zoom, this.minZoom), this.maxZoom)

    if (coords.length) {
      this.canvas.zoomToPoint(new fabric.Point(coords[0], coords[1]), normalizedZoom)
    } else {
      this.canvas.setZoom(normalizedZoom)
      this._setCenterFromObject(this.editor.workspace)
    }

    // Emit the zoom event
    this.editor.emit("zoomChange", normalizedZoom)
  }

  // Zoom in
  zoomIn() {
    const nearestZoom = this._findNearestZoomLevel("up")
    this.setZoom(nearestZoom)
  }

  // Zoom out
  zoomOut() {
    const nearestZoom = this._findNearestZoomLevel("down")
    this.setZoom(nearestZoom)
  }

  // Zoom to fit
  zoomToFit() {
    const zoom = this._getScale()
    this.setZoom(zoom * this.zoomRatio)
  }
}

export default WorkspacePlugin
