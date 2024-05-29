import { FabricObject } from "fabric"
import type Handler from "./Handler"
import { check } from "../utils/check"

class CopyPasteHandler {
  handler: Handler

  /**
   * The object that is currently in the clipboard
   */
  clipboard: FabricObject | undefined = undefined

  constructor(handler: Handler) {
    this.handler = handler

    this.handler.registerHotkeyHandlers(
      { key: "cmd+c", handler: this.copy.bind(this) },
      { key: "cmd+v", handler: this.paste.bind(this) }
    )
  }

  /**
   * Copy the currently selected object to the clipboard
   */
  public async copy() {
    // clone what are you copying since you
    // may want copy and paste on different moment.
    // and you do not want the changes happened
    // later to reflect on the copy.
    const activeObject = this.handler.canvas.getActiveObject()

    if (activeObject) {
      const clone = await activeObject?.clone()
      this.clipboard = clone
    }
  }

  /**
   * Paste the object that is currently in the clipboard
   */
  public async paste() {
    if (!this.clipboard) return

    // Clone again, so you can do multiple copies.
    const clone = await this.clipboard.clone()

    clone.set({
      left: clone.left + 10,
      top: clone.top + 10,
      evented: true,
    })

    if (check.isActiveSelection(clone)) {
      for (const object of clone.getObjects()) {
        this.handler.canvas.add(object)
      }
    } else {
      this.handler.canvas.add(clone)
    }

    // Move the object slightly to indicate that it's a different object
    this.clipboard.top += 10
    this.clipboard.left += 10

    this.handler.canvas.setActiveObject(clone)
    this.handler.canvas.requestRenderAll()
  }
}

export default CopyPasteHandler
