import { fabric } from "fabric"
import { InteractionMode } from "../utils/types"
import type Handler from "./Handler"

class InteractionHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler

    this.handler.registerHotkeyHandlers(
      { key: "v", handler: () => this.setInteractionMode(InteractionMode.SELECT) },
      { key: "h", handler: () => this.setInteractionMode(InteractionMode.PAN) }
    )
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
        this.handler.canvas.selection = this.handler.canvasOptions?.selection
        break
      case InteractionMode.PAN:
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
  public moving(e: MouseEvent) {
    const delta = new fabric.Point(e.movementX, e.movementY)
    this.handler.canvas.relativePan(delta)
    this.handler.canvas.requestRenderAll()
  }
}

export default InteractionHandler
