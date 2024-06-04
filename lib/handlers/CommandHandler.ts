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

    this.isCut = true
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

    await this.cloneObject(this.clipboard)
  }

  /**
   * Duplicate the currently selected object
   */
  public async duplicate() {
    const activeObject = this.handler.canvas.getActiveObject()

    if (activeObject) {
      await this.cloneObject(activeObject)
    }
  }

  /**
   * Delete active objects
   */
  public delete() {
    const activeObject = this.handler.canvas.getActiveObject()

    if (activeObject) {
      this.handler.removeObject(activeObject)
    }
  }

  /**
   * Select all objects
   */
  public selectAll() {
    const objects = this.handler.getObjects()

    if (objects.length) {
      const activeObject = new ActiveSelection(objects)

      this.handler.canvas.setActiveObject(activeObject)
      this.handler.canvas.requestRenderAll()
    }
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
  public move(direction: "left" | "top", increment: number) {
    const activeObject = this.handler.canvas.getActiveObject()

    // If there is no active object, return
    if (!activeObject) return

    activeObject.set(direction, (activeObject[direction] ?? 0) + increment)
    activeObject.setCoords()

    this.handler.canvas.requestRenderAll()
    this.handler.canvas.fire("object:modified", { target: activeObject })
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
