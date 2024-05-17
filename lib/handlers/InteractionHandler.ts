import { fabric } from "fabric"
import { InteractionMode } from "../utils/types"
import type Handler from "./Handler"

class InteractionHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler
  }

  /**
   * Set interaction mode
   */
  public setInteractionMode = (mode: InteractionMode) => {
    if (this.handler.store.getState().interactionMode === mode) {
      return
    }

    this.handler.store.setState({ interactionMode: mode })

    switch (mode) {
      case InteractionMode.SELECT:
        this.handler.canvas.defaultCursor = "default"
        this.handler.canvas.selection = this.handler.canvasOptions?.selection
        if (this.handler.workspace) {
          this.handler.workspace.hoverCursor = "default"
        }
        break
      case InteractionMode.PAN:
        this.handler.canvas.defaultCursor = "grab"
        this.handler.canvas.selection = false
        if (this.handler.workspace) {
          this.handler.workspace.hoverCursor = "grab"
        }
        break
    }

    for (const obj of this.handler.canvas.getObjects()) {
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
  public moving = (e: MouseEvent) => {
    const delta = new fabric.Point(e.movementX, e.movementY)
    this.handler.canvas.relativePan(delta)
    this.handler.canvas.requestRenderAll()
  }
}

export default InteractionHandler
