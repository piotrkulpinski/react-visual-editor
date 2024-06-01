import { CanvasEvents, Point } from "fabric"
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
  }

  /**
   * Mouse wheel event
   */
  private onMouseWheel({ e }: CanvasEvents["mouse:wheel"]) {
    e.preventDefault()
    e.stopPropagation()

    if (!e.metaKey && !e.ctrlKey) {
      const delta = new Point(-e.deltaX, -e.deltaY)
      this.handler.canvas.relativePan(delta)
      this.handler.canvas.requestRenderAll()
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

  /**
   * Moving objects in pan mode
   */
  public moving({ e }: CanvasEvents["mouse:move"]) {
    if (e instanceof MouseEvent) {
      const delta = new Point(e.movementX, e.movementY)
      this.handler.canvas.relativePan(delta)
      this.handler.canvas.requestRenderAll()
    }
  }
}

export default InteractionHandler
