import { CanvasEvents, FabricObject } from "fabric"
import type Handler from "./Handler"
import { check } from "../utils/check"

class CloneHandler {
  handler: Handler

  private originalObject: FabricObject | undefined = undefined
  private cloneObject: FabricObject | undefined = undefined

  constructor(handler: Handler) {
    this.handler = handler

    this.handler.canvas.on({
      "mouse:down": this.onMouseDown.bind(this),
      "object:moving": this.onObjectMoving.bind(this),
      "object:modified": this.onObjectModified.bind(this),
    })
  }

  /**
   * Store the original object when the mouse is down
   */
  private async onMouseDown({ target }: CanvasEvents["mouse:down"]) {
    if (target?.selectable && !this.cloneObject) {
      this.originalObject = await target.clone()
    }
  }

  /**
   * Clone the object when the mouse is moving
   */
  private async onObjectMoving({ target, e }: CanvasEvents["object:moving"]) {
    // If the alt key is pressed create a clone of the object
    if (e.altKey && !this.cloneObject) {
      this.cloneObject = await target.clone()

      if (check.isActiveSelection(this.cloneObject)) {
        for (const object of this.cloneObject.getObjects()) {
          this.handler.canvas.add(object)
        }
      } else {
        this.handler.canvas.add(this.cloneObject)
      }
    }

    // If the alt is released, remove the clone object
    if (!e.altKey && this.cloneObject) {
      this.handler.canvas.remove(this.cloneObject)
      this.cloneObject = undefined
    }

    // Set the position of the clone object to the original object
    if (this.cloneObject) {
      this.cloneObject?.set({
        left: this.originalObject?.left,
        top: this.originalObject?.top,
      })
    }
  }

  /**
   * Remove the clone object when the object is modified
   */
  private onObjectModified() {
    if (this.cloneObject) {
      this.cloneObject = undefined
      this.handler.canvas.renderAll()
    }
  }
}

export default CloneHandler
