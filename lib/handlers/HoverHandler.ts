import { CanvasEvents } from "fabric"
import type Handler from "./Handler"

class HoverHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler

    this.handler.canvas.on("mouse:over", this.onMouseOver.bind(this))
    this.handler.canvas.on("mouse:out", this.onMouseOut.bind(this))
  }

  /**
   * Show the controls when the mouse is over the object
   */
  private onMouseOver(e: CanvasEvents["mouse:over"]) {
    if (e.target === this.handler.canvas._activeObject || !e.target?.selectable) {
      return
    }

    e.target?._renderControls(this.handler.canvas.getContext(), {
      hasControls: false,
    })
  }

  /**
   * Re-render the canvas to hide the controls
   */
  private onMouseOut() {
    this.handler.canvas.renderAll()
  }
}

export default HoverHandler
