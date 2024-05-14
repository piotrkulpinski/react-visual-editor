import type Editor from "../Editor"

declare type ExtCanvas = fabric.Canvas & {
  isDragging: boolean
  lastPosX: number
  lastPosY: number
}

class DragingPlugin {
  public canvas: fabric.Canvas
  public editor: Editor
  public defautOption = {}
  static pluginName = "DragingPlugin"
  static events = ["startDraging", "endDraging"]
  static apis = ["startDraging", "endDraging"]
  public hotkeys: string[] = ["space"]
  dragMode = false

  constructor(canvas: fabric.Canvas, editor: Editor) {
    this.canvas = canvas
    this.editor = editor
    this.dragMode = false
    this.init()
  }
  init() {
    this._initDraging()
  }

  startDraging() {
    this.dragMode = true
    this.canvas.defaultCursor = "grab"
    this.editor.emit("startDraging")
    this.canvas.renderAll()
  }
  endDraging() {
    this.dragMode = false
    this.canvas.defaultCursor = "default"
    this.canvas.isDragging = false
    this.editor.emit("endDraging")
    this.canvas.renderAll()
  }

  // Drag and drop mode;
  _initDraging() {
    const This = this

    this.canvas.on("mouse:down", function (this: ExtCanvas, opt) {
      const evt = opt.e
      if (evt.altKey || This.dragMode) {
        This.canvas.defaultCursor = "grabbing"
        This.canvas.discardActiveObject()
        This._setDraging()
        this.selection = false
        this.isDragging = true
        this.lastPosX = evt.clientX
        this.lastPosY = evt.clientY
        this.requestRenderAll()
      }
    })

    this.canvas.on("mouse:move", function (this: ExtCanvas, opt) {
      if (this.isDragging) {
        This.canvas.discardActiveObject()
        This.canvas.defaultCursor = "grabbing"
        const { e } = opt
        if (!this.viewportTransform) return
        const vpt = this.viewportTransform
        vpt[4] += e.clientX - this.lastPosX
        vpt[5] += e.clientY - this.lastPosY
        this.lastPosX = e.clientX
        this.lastPosY = e.clientY
        this.requestRenderAll()
      }
    })

    this.canvas.on("mouse:up", function (this: ExtCanvas) {
      if (!this.viewportTransform) return
      this.setViewportTransform(this.viewportTransform)
      this.isDragging = false
      this.selection = true

      for (const obj of this.getObjects()) {
        if (obj.id !== "workspace" && obj.hasControls) {
          obj.selectable = true
        }
      }

      This.canvas.defaultCursor = "default"
      this.requestRenderAll()
    })
  }

  _setDraging() {
    this.canvas.selection = false
    this.canvas.defaultCursor = "grab"

    for (const obj of this.canvas.getObjects()) {
      obj.selectable = false
    }

    this.canvas.requestRenderAll()
  }

  // Shortcut key extension callback
  hotkeyEvent(eventName: string, { code, type }: KeyboardEvent) {
    if (code !== "Space") return

    if (type === "keydown" && !this.dragMode) {
      this.startDraging()
    }

    if (type === "keyup") {
      this.endDraging()
    }
  }
}

export default DragingPlugin
