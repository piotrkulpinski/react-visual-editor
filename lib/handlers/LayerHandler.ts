import { Handler } from "./Handler"
import { LayerCommand } from "../utils/types"
import { throttle } from "radash"

export class LayerHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler

    this.handler.registerHotkeyHandlers(
      { key: "cmd+]", handler: throttle({ interval: 100 }, this.bringForward.bind(this)) },
      { key: "cmd+[", handler: throttle({ interval: 100 }, this.sendBackwards.bind(this)) },
      { key: "]", handler: throttle({ interval: 100 }, this.bringToFront.bind(this)) },
      { key: "[", handler: throttle({ interval: 100 }, this.sendToBack.bind(this)) }
    )
  }

  /**
   * Bring the active object forward
   */
  public bringForward() {
    this.changeObjectLayer(LayerCommand.FORWARD)
  }

  /**
   * Bring the active object forward
   */
  public sendBackwards() {
    this.changeObjectLayer(LayerCommand.BACKWARDS)
  }

  /**
   * Bring the active object to the front
   */
  public bringToFront() {
    this.changeObjectLayer(LayerCommand.FRONT)
  }

  /**
   * Send the active object to the back
   */
  public sendToBack() {
    this.changeObjectLayer(LayerCommand.BACK)
  }

  /**
   * Move the active object to a specific layer
   */
  public moveTo(layer: number) {
    this.changeObjectLayer(LayerCommand.MOVE, layer)
  }

  /**
   * Change the layer of the active object
   */
  private changeObjectLayer(command: LayerCommand, layer?: number) {
    const activeObject = this.handler.canvas.getActiveObject()

    if (!activeObject) return

    switch (command) {
      case LayerCommand.FORWARD:
        this.handler.canvas.bringObjectForward(activeObject)
        break
      case LayerCommand.BACKWARDS:
        this.handler.canvas.sendObjectBackwards(activeObject)
        break
      case LayerCommand.FRONT:
        this.handler.canvas.bringObjectToFront(activeObject)
        break
      case LayerCommand.BACK:
        this.handler.canvas.sendObjectToBack(activeObject)
        break
      case LayerCommand.MOVE:
        layer && this.handler.canvas.moveObjectTo(activeObject, layer)
        break
      default:
        break
    }

    this.handler.canvas.sendObjectToBack(this.handler.workspace)
    this.handler.canvas.renderAll()

    // Save history action
    this.handler.historyHandler.saveState()
  }
}
