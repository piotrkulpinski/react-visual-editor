import type Handler from "./Handler"

class DeleteHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler

    this.handler.registerHotkeyHandlers({
      key: "backspace, delete",
      handler: this.delete.bind(this),
    })
  }

  public delete() {
    const activeObjects = this.handler.canvas.getActiveObjects()

    if (activeObjects) {
      activeObjects.map((item) => this.handler.canvas.remove(item))

      this.handler.canvas.discardActiveObject()
      this.handler.canvas.requestRenderAll()
    }
  }
}

export default DeleteHandler
