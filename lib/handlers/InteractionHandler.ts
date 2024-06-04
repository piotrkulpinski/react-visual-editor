import { CanvasEvents, Point, TPointerEvent } from "fabric"
import { InteractionMode } from "../utils/types"
import type Handler from "./Handler"

class InteractionHandler {
  handler: Handler

  /**
   * Store the default selection state
   */
  defaultSelection: boolean

  constructor(handler: Handler) {
    this.handler = handler
    this.defaultSelection = this.handler.canvas.selection

    this.handler.registerHotkeyHandlers(
      { key: "v", handler: () => this.setInteractionMode(InteractionMode.SELECT) },
      { key: "h", handler: () => this.setInteractionMode(InteractionMode.PAN) }
    )

    // Register canvas events
    this.handler.canvas.on("mouse:wheel", this.onMouseWheel.bind(this))
    this.handler.canvas.on("selection:created", this.onSelectionCreated.bind(this))
  }

  /**
   * Pan the canvas when the mouse is moving
   */
  public panCanvas(e: TPointerEvent | WheelEvent) {
    let delta: Point | undefined = undefined

    if (e instanceof MouseEvent) {
      delta = new Point(e.movementX, e.movementY)
    }

    if (e instanceof WheelEvent) {
      delta = new Point(e.deltaX, e.deltaY)
    }

    if (delta) {
      this.handler.canvas.relativePan(delta)
      this.handler.canvas.requestRenderAll()
    }
  }

  /**
   * Mouse wheel event
   */
  private onMouseWheel({ e }: CanvasEvents["mouse:wheel"]) {
    e.preventDefault()
    e.stopPropagation()

    // ctrlKey is set when pinch-zoom is detected
    if (!e.metaKey && !e.ctrlKey) {
      this.panCanvas(e)
    }
  }

  /**
   * Selection created event
   */
  private onSelectionCreated({ selected }: CanvasEvents["selection:created"]) {
    const mode = this.handler.store.getState().interactionMode

    for (const object of selected) {
      switch (mode) {
        case InteractionMode.SELECT:
          object.hoverCursor = "move"
          object.selectable = true
          break
        case InteractionMode.PAN:
          object.selectable = false
          break
      }
    }

    if (mode === InteractionMode.PAN) {
      this.handler.canvas.discardActiveObject()
    }
  }

  /**
   * Set interaction mode
   */
  public setInteractionMode(mode: InteractionMode) {
    if (!this.handler.isReady()) {
      return
    }

    if (this.handler.store.getState().interactionMode === mode) {
      return
    }

    this.handler.store.setState({ interactionMode: mode })

    switch (mode) {
      case InteractionMode.SELECT:
        this.handler.canvas.setCursor("default")
        this.handler.canvas.selection = this.defaultSelection
        break
      case InteractionMode.PAN:
        this.defaultSelection = this.handler.canvas.selection
        this.handler.canvas.discardActiveObject()
        this.handler.canvas.setCursor("grab")
        this.handler.canvas.selection = false
        break
    }

    for (const obj of this.handler.getObjects()) {
      switch (mode) {
        case InteractionMode.SELECT:
          obj.hoverCursor = "move"
          obj.selectable = true
          break
        case InteractionMode.PAN:
          obj.selectable = false
          break
      }
    }

    this.handler.canvas.renderAll()
    this.handler.onInteraction?.(mode)
  }
}

export default InteractionHandler
