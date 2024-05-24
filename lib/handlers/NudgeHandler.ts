/* eslint-disable @typescript-eslint/no-unused-vars */
import Handler from "./Handler"

class NudgeHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler

    // Register the hotkey handler
    this.handler.registerHotkeyHandlers({
      key: "*",
      handler: this.moveActiveObject.bind(this),
    })
  }

  /**
   * Move the active object by a small increment
   * @param event - The keyboard event
   */
  public moveActiveObject({ type, key, shiftKey }: KeyboardEvent) {
    // If the key is not a keydown event, return
    if (type !== "keydown") return

    const activeObject = this.handler.canvas.getActiveObject()

    // If there is no active object, return
    if (!activeObject) return

    const increment = shiftKey ? 10 : 1
    const { left, top } = activeObject

    switch (key) {
      case "ArrowLeft":
        activeObject.set("left", (left ?? 0) - increment)
        break
      case "ArrowRight":
        activeObject.set("left", (left ?? 0) + increment)
        break
      case "ArrowDown":
        activeObject.set("top", (top ?? 0) + increment)
        break
      case "ArrowUp":
        activeObject.set("top", (top ?? 0) - increment)
        break
      default:
        return
    }

    activeObject.setCoords()
    this.handler.canvas.renderAll()
    this.handler.onModified?.(activeObject)
  }
}

export default NudgeHandler
