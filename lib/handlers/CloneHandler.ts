/* eslint-disable @typescript-eslint/no-unused-vars */
import { CanvasEvents, FabricObject } from "fabric"
import type Handler from "./Handler"

class CloneHandler {
  handler: Handler

  private originalObject: FabricObject | undefined = undefined
  private cloneObject: FabricObject | undefined = undefined

  constructor(handler: Handler) {
    this.handler = handler

    // Register hotkeys
    this.handler.registerHotkeyHandlers({
      key: "*",
      handler: this.onKeyPressed.bind(this),
    })

    this.handler.canvas.on({
      "mouse:down": this.onMouseDown.bind(this),
      "mouse:up": this.onMouseUp.bind(this),
    })
  }

  /**
   * Handle the key press event
   */
  private async onKeyPressed(e: KeyboardEvent) {
    if (e.type === "keyup" && !e.altKey && this.cloneObject) {
      this.handler.removeObject(this.cloneObject)
      this.cloneObject = undefined
    }

    // If the alt key is pressed create a clone of the object
    if (e.type === "keydown" && e.altKey && !this.cloneObject && this.originalObject) {
      this.cloneObject = await this.originalObject.clone()
      this.handler.addObject(this.cloneObject)
    }
  }

  /**
   * Store the original object when the mouse is down
   */
  private async onMouseDown({ target, e }: CanvasEvents["mouse:down"]) {
    if (target?.selectable && !this.cloneObject) {
      this.originalObject = await target.clone()
    }

    // Check if the alt is pressed and clone object right away
    if (e.altKey && !this.cloneObject && this.originalObject) {
      this.cloneObject = await this.originalObject.clone()
      this.handler.addObject(this.cloneObject)
    }
  }

  /**
   * Clean up state when the mouse is up
   */
  private onMouseUp() {
    this.cloneObject = undefined
    this.originalObject = undefined
  }
}

export default CloneHandler
