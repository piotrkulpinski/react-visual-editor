import { ActiveSelection, FabricObject } from "fabric"
import { Handler } from "./Handler"

export class CommandHandler {
  handler: Handler

  /**
   * The object that is currently in the clipboard
   */
  clipboard: FabricObject | undefined = undefined

  /**
   * A flag to check if the object is cut
   */
  isCut: boolean = false

  constructor(handler: Handler) {
    this.handler = handler

    this.handler.registerHotkeyHandlers(
      { key: "cmd+x", handler: () => this.cut.call(this) },
      { key: "cmd+c", handler: () => this.copy.call(this) },
      { key: "cmd+v", handler: () => this.paste.call(this) },
      { key: "cmd+d", handler: () => this.duplicate.call(this) },
      { key: "cmd+a", handler: () => this.selectAll.call(this) },
      { key: "backspace, delete", handler: () => this.delete.call(this) },
      { key: "escape", handler: () => this.discard.call(this) },
      { key: "*", handler: this.onMove.bind(this) }
    )
  }

  /**
   * Cut the object to the clipboard
   * @param obj - The object to cut
   */
  public async cut(obj?: FabricObject) {
    await this.copy(obj)
    this.delete()

    this.isCut = true
  }

  /**
   * Copy the object to the clipboard
   * @param obj - The object to copy
   */
  public async copy(obj?: FabricObject) {
    const object = obj ?? this.handler.canvas.getActiveObject()

    // If there is no object, return
    if (!object) return

    // Clone what are you copying since you
    // may want copy and paste on different moment.
    // and you do not want the changes happened
    // later to reflect on the copy.
    const clone = await object.clone()
    this.clipboard = clone
  }

  /**
   * Paste the object that is currently in the clipboard
   */
  public async paste() {
    if (!this.clipboard) return

    await this.cloneObject(this.clipboard)
  }

  /**
   * Duplicate the object
   * @param obj - The object to duplicate
   */
  public async duplicate(obj?: FabricObject) {
    const object = obj ?? this.handler.canvas.getActiveObject()

    // If there is no object, return
    if (!object) return

    // Duplicate the object
    await this.cloneObject(object)
  }

  /**
   * Delete the object from the canvas
   * @param obj - The object to delete
   */
  public delete(obj?: FabricObject) {
    const object = obj ?? this.handler.canvas.getActiveObject()

    // If there is no object, return
    if (!object) return

    // Remove the object from the canvas
    this.handler.removeObject(object)
  }

  /**
   * Select all objects
   */
  public selectAll() {
    const objects = this.handler.getObjects().filter((o) => o.selectable && o.visible)

    // If there is no objects, return
    if (!objects.length) return

    const activeObject = new ActiveSelection(objects)

    this.handler.canvas.discardActiveObject()
    this.handler.canvas.setActiveObject(activeObject)
    this.handler.canvas.requestRenderAll()
  }

  /**
   * Discard the active object
   */
  public discard() {
    this.handler.canvas.discardActiveObject()
    this.handler.canvas.requestRenderAll()
  }

  /**
   * Move the active object by a small increment
   * @param direction - The direction to move the object
   * @param increment - The amount to move the object
   */
  public move(direction: "left" | "top", increment = 1) {
    const object = this.handler.canvas.getActiveObject()

    // If there is no active object, return
    if (!object) return

    if (
      (direction === "left" && object.lockMovementX) ||
      (direction === "top" && object.lockMovementY)
    ) {
      return
    }

    object.set(direction, (object[direction] ?? 0) + increment)
    object.setCoords()

    this.handler.canvas.requestRenderAll()
    this.handler.canvas.fire("object:modified", { target: object })
  }

  /**
   * Toggle the lock status of the object
   * @param obj - The object to toggle the lock status
   * @param status - The status to set the lock to
   */
  public toggleLock(obj?: FabricObject, status = true) {
    const activeObject = this.handler.canvas.getActiveObject()
    const object = obj ?? activeObject

    // If there is no object, return
    if (!object) return

    // Lock the object
    object.lockMovementX = status
    object.lockMovementY = status
    object.selectable = !status
    object.hoverCursor = status ? "not-allowed" : "move"

    if (status && activeObject === object) {
      this.handler.canvas.discardActiveObject()
    }

    this.handler.canvas.requestRenderAll()
    this.handler.canvas.fire("object:modified", { target: object })
  }

  /**
   * Lock the object
   * @param object - The object to lock
   */
  public lock(object?: FabricObject) {
    this.toggleLock(object, true)
  }

  /**
   * Unlock the object
   * @param object - The object to unlock
   */
  public unlock(object?: FabricObject) {
    this.toggleLock(object, false)
  }

  /**
   * Toggle the visibility of the object
   * @param obj - The object to toggle the visibility
   * @param visible - The visibility status to set
   */
  public toggleVisibility = (obj?: FabricObject, visible = false) => {
    const activeObject = this.handler.canvas.getActiveObject()
    const object = obj ?? activeObject

    // If there is no object, return
    if (!object) return

    // Lock the object
    object.visible = visible

    if (!visible && activeObject === object) {
      this.handler.canvas.discardActiveObject()
    }

    this.handler.canvas.requestRenderAll()
    this.handler.canvas.fire("object:modified", { target: object })
  }

  /**
   * Show the object
   * @param object - The object to show
   */
  public show(object?: FabricObject) {
    this.toggleVisibility(object, true)
  }

  /**
   * Hide the object
   * @param object - The object to hide
   */
  public hide(object?: FabricObject) {
    this.toggleVisibility(object, false)
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
   */
  private async cloneObject(object: FabricObject) {
    const clone = await object.clone()
    const adjustSize = this.isCut ? 0 : 10

    // Adjust the position of the object in the clipboard
    this.clipboard?.set({
      left: this.clipboard.left + adjustSize,
      top: this.clipboard.top + adjustSize,
    })

    // Reset the clipboard if the object is cut
    if (this.isCut) {
      this.isCut = false
      this.clipboard = undefined
    }

    // Adjust the position of the clone
    clone.set({
      left: clone.left + adjustSize,
      top: clone.top + adjustSize,
      evented: true,
    })

    // Add the clone to the canvas
    this.handler.addObject(clone)
  }
}
