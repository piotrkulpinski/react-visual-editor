import { CanvasEvents, Point } from "fabric"
import { Handler } from "./Handler"

export class AxisLockHandler {
  handler: Handler

  /**
   * The starting point of the object
   */
  private startingPoint: Point | undefined = undefined

  constructor(handler: Handler) {
    this.handler = handler

    this.handler.canvas.on({
      "mouse:down": this.onMouseDown.bind(this),
      "mouse:up": this.onMouseUp.bind(this),
      "object:moving": this.onObjectMoving.bind(this),
    })
  }

  /**
   * Store the starting point of the object when the mouse is down
   */
  private onMouseDown({ target }: CanvasEvents["mouse:down"]) {
    if (target) {
      this.startingPoint = target._getLeftTopCoords()
    }
  }

  /**
   * Remove the starting point of the object when the mouse is up
   */
  private onMouseUp() {
    this.startingPoint = undefined
  }

  /**
   * Lock the object to the x or y axis when the shift key is pressed
   */
  private onObjectMoving({ target, e }: CanvasEvents["object:moving"]) {
    if (this.startingPoint && e.shiftKey) {
      const deltaX = Math.abs(target.left - this.startingPoint.x)
      const deltaY = Math.abs(target.top - this.startingPoint.y)

      if (deltaX > deltaY) {
        target.top = this.startingPoint.y
      } else {
        target.left = this.startingPoint.x
      }
    }
  }
}
