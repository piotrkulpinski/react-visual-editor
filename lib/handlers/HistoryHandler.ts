import { throttle } from "radash"
import type Handler from "./Handler"
import { FabricObject, util } from "fabric"

class HistoryHandler {
  handler: Handler

  undoStack: string[] = []
  redoStack: string[] = []
  state: string = "[]"
  isActive: boolean = false
  propertiesToInclude: string[] = ["id"]

  constructor(handler: Handler) {
    this.handler = handler

    this.handler.registerHotkeyHandlers(
      { key: "cmd+z", handler: () => this.undo() },
      { key: "cmd+shift+z", handler: () => this.redo() }
    )
  }

  /**
   * Save action
   */
  public save = (replaceLast = false) => {
    if (this.isActive) return

    if (this.state) {
      this.redoStack = []

      if (replaceLast) {
        this.undoStack.splice(this.undoStack.length - 1, 1, this.state)
      } else {
        this.undoStack.push(this.state)
      }
    }

    const rawJSON = this.handler.canvas.toDatalessJSON(this.propertiesToInclude)
    const objects = this.handler.getObjects(rawJSON.objects)

    this.state = JSON.stringify(objects)
  }

  /**
   * Undo last action
   */
  public undo = throttle({ interval: 50 }, () => {
    if (!this.undoStack.length) return

    const undo = this.undoStack.pop()!
    this.redoStack.push(this.state)
    this.replay(undo)
  })

  /**
   * Redo last action
   */
  public redo = throttle({ interval: 50 }, () => {
    if (!this.redoStack.length) return

    const redo = this.redoStack.pop()!
    this.undoStack.push(this.state)
    this.replay(redo)
  })

  /**
   * Replay action from state
   *
   * @param state - State to replay
   */
  private replay = (state: string) => {
    const objects = JSON.parse(state) as FabricObject[]

    this.state = state
    this.isActive = true
    this.handler.canvas.renderOnAddRemove = false
    this.handler.clear()

    util.enlivenObjects(objects).then((objects) => {
      objects.forEach((object) => {
        const targetIndex = this.handler.canvas._objects.length
        this.handler.canvas.insertAt(targetIndex, object as FabricObject)
      })

      this.handler.canvas.renderOnAddRemove = true
      this.handler.canvas.requestRenderAll()
      this.isActive = false
    })
  }
}

export default HistoryHandler
