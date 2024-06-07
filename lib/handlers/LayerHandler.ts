import { Handler } from "./Handler"
import { LayerCommand } from "../utils/types"
import { throttle } from "radash"
import { FabricObject } from "fabric"

export class LayerHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler

    this.handler.registerHotkeyHandlers(
      { key: "cmd+]", handler: () => this.throttledHandler(this.bringForward) },
      { key: "cmd+[", handler: () => this.throttledHandler(this.sendBackwards) },
      { key: "]", handler: () => this.throttledHandler(this.bringToFront) },
      { key: "[", handler: () => this.throttledHandler(this.sendToBack) }
    )
  }

  /**
   * Bring the active object forward
   */
  public bringForward(object?: FabricObject) {
    this.changeObjectLayer(LayerCommand.FORWARD, object)
  }

  /**
   * Bring the active object forward
   */
  public sendBackwards(object?: FabricObject) {
    this.changeObjectLayer(LayerCommand.BACKWARDS, object)
  }

  /**
   * Bring the active object to the front
   */
  public bringToFront(object?: FabricObject) {
    this.changeObjectLayer(LayerCommand.FRONT, object)
  }

  /**
   * Send the active object to the back
   */
  public sendToBack(object?: FabricObject) {
    this.changeObjectLayer(LayerCommand.BACK, object)
  }

  /**
   * Move the active object to a specific layer
   */
  public moveTo(layer: number, object?: FabricObject) {
    this.changeObjectLayer(LayerCommand.MOVE, object, layer)
  }

  /**
   * Change the layer of the active object
   */
  private changeObjectLayer(command: LayerCommand, object?: FabricObject, layer?: number) {
    const activeObject = this.handler.canvas.getActiveObject()
    const objects = object ? [object] : this.handler.getObjectsFromSelection(activeObject)

    for (const object of objects) {
      switch (command) {
        case LayerCommand.FORWARD:
          this.handler.canvas.bringObjectForward(object)
          break
        case LayerCommand.BACKWARDS:
          this.handler.canvas.sendObjectBackwards(object)
          break
        case LayerCommand.FRONT:
          this.handler.canvas.bringObjectToFront(object)
          break
        case LayerCommand.BACK:
          this.handler.canvas.sendObjectToBack(object)
          break
        case LayerCommand.MOVE:
          layer && this.handler.canvas.moveObjectTo(object, layer)
          break
        default:
          break
      }

      // Fire modified event
      this.handler.canvas.fire("object:modified", { target: object })
    }

    this.handler.canvas.sendObjectToBack(this.handler.workspace)
    this.handler.canvas.renderAll()

    // Save history action
    this.handler.historyHandler.saveState()
  }

  /**
   * Throttled function handler
   * @param fn Function to throttle
   * @param interval Throttle interval
   */
  private throttledHandler(fn: () => void, interval = 100) {
    return throttle({ interval }, fn.bind(this))()
  }
}
