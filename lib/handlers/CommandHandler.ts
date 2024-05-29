import { ActiveSelection, FabricObject } from "fabric"
import type Handler from "./Handler"
import { check } from "../utils/check"

class CommandHandler {
  handler: Handler

  /**
   * The object that is currently in the clipboard
   */
  clipboard: FabricObject | undefined = undefined

  constructor(handler: Handler) {
    this.handler = handler

    this.handler.registerHotkeyHandlers(
      { key: "cmd+x", handler: this.cut.bind(this) },
      { key: "cmd+c", handler: this.copy.bind(this) },
      { key: "cmd+v", handler: this.paste.bind(this) },
      { key: "cmd+d", handler: this.duplicate.bind(this) },
      { key: "cmd+a", handler: this.selectAll.bind(this) },
      { key: "backspace, delete", handler: this.delete.bind(this) },
      { key: "escape", handler: this.discard.bind(this) },
      { key: "*", handler: this.onMove.bind(this) }
    )
  }

  /**
   * Cut the currently selected object to the clipboard
   */
  public async cut() {
    await this.copy()
    this.delete()
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
      const clone = await activeObject.clone()
      this.clipboard = clone
    }
  }

  /**
   * Paste the object that is currently in the clipboard
   */
  public async paste() {
    if (!this.clipboard) return

    await this.cloneObject(this.clipboard, true)
  }

  /**
   * Duplicate the currently selected object
   */
  public async duplicate() {
    const activeObject = this.handler.canvas.getActiveObject()

    if (activeObject) {
      await this.cloneObject(activeObject, true)
    }
  }

  /**
   * Delete active objects
   */
  public delete() {
    const activeObjects = this.handler.canvas.getActiveObjects()

    if (activeObjects) {
      activeObjects.map((item) => this.handler.canvas.remove(item))

      this.handler.canvas.discardActiveObject()
      this.handler.canvas.requestRenderAll()
    }
  }

  /**
   * Select all objects
   */
  public selectAll() {
    const objects = this.handler.getObjects()
    const activeObject = new ActiveSelection(objects)

    this.handler.canvas.setActiveObject(activeObject)
    this.handler.canvas.requestRenderAll()
  }

  /**
   * Discard the active object
   */
  public discard() {
    this.handler.canvas.discardActiveObject()
    this.handler.canvas.renderAll()
  }

  /**
   * Move the active object by a small increment
   * @param direction - The direction to move the object
   * @param increment - The amount to move the object
   */
  public move(direction: "left" | "top", increment: number) {
    const activeObject = this.handler.canvas.getActiveObject()

    // If there is no active object, return
    if (!activeObject) return

    activeObject.set(direction, (activeObject[direction] ?? 0) + increment)
    activeObject.setCoords()

    this.handler.canvas.renderAll()
    this.handler.onModified?.(activeObject)
  }

  /**
   * Move the active object by a small increment
   * @param event - The keyboard event
   */
  private onMove({ type, key, shiftKey }: KeyboardEvent) {
    // If the key is not a keydown event, return
    if (type !== "keydown") return

    const increment = shiftKey ? 10 : 1

    switch (key) {
      case "ArrowLeft":
        return this.move("left", -increment)
      case "ArrowRight":
        return this.move("left", increment)
      case "ArrowUp":
        return this.move("top", -increment)
      case "ArrowDown":
        return this.move("top", increment)
      default:
        return
    }
  }

  /**
   * Helper method to clone an object
   * @param object - The object to clone
   * @param adjustPosition - If true, adjusts the position of the cloned object
   */
  private async cloneObject(object: FabricObject, adjustPosition = false) {
    const clone = await object.clone()
    const adjustSize = adjustPosition ? 10 : 0

    clone.set({
      left: clone.left + adjustSize,
      top: clone.top + adjustSize,
    })

    if (this.clipboard) {
      this.clipboard.set({
        left: this.clipboard.left + adjustSize,
        top: this.clipboard.top + adjustSize,
      })
    }

    if (check.isActiveSelection(clone)) {
      for (const object of clone.getObjects()) {
        this.handler.canvas.add(object)
      }
    } else {
      this.handler.canvas.add(clone)
    }

    this.handler.canvas.setActiveObject(clone)
    this.handler.canvas.requestRenderAll()
  }
}

export default CommandHandler
