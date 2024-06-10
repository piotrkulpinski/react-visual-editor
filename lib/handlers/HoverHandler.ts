import { CanvasEvents, FabricObject } from "fabric"
import { Handler } from "./Handler"

export class HoverHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler

    this.handler.canvas.on({
      "mouse:over": this.onMouseOver.bind(this),
      "mouse:out": this.onMouseOut.bind(this),
    })
  }

  /**
   * Show the controls when the mouse is over the object
   */
  private onMouseOver({ target }: CanvasEvents["mouse:over"]) {
    target?.selectable && this.hoverObject(target)
  }

  /**
   * On mouse out, hide the controls
   */
  private onMouseOut() {
    this.unhoverObject()
  }

  /**
   * Show the minimal controls for the object
   * @param object - Object to hover
   */
  public hoverObject(object?: FabricObject) {
    if (object === this.handler.canvas._activeObject) {
      return
    }

    object?._renderControls(this.handler.canvas.getContext(), {
      hasControls: false,
    })
  }

  /**
   * Re-render the canvas to hide the controls
   */
  public unhoverObject() {
    this.handler.canvas.renderAll()
  }
}
