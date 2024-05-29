import { CanvasEvents } from "fabric"
import type Handler from "./Handler"

type HistoryAction = string | Record<string, any>

class HistoryHandler {
  handler: Handler
  isProcessing: boolean = false
  currentState: number = -1
  history: HistoryAction[] = []
  extraProps = ["selectable", "editable"]

  constructor(handler: Handler) {
    this.handler = handler

    this.handler.registerHotkeyHandlers(
      { key: "cmd+z", handler: () => this.undo() },
      { key: "cmd+shift+z", handler: () => this.redo() }
    )

    this.handler.canvas.on({
      "object:added": this.saveAction.bind(this),
      "object:removed": this.saveAction.bind(this),
      "object:modified": this.saveAction.bind(this),
      "object:skewing": this.saveAction.bind(this),
    })
  }

  public undo(callback?: () => void) {
    if (this.currentState > 0) {
      this.processAction(this.currentState - 1, "history:undo", callback)
    }
  }

  public redo(callback?: () => void) {
    if (this.currentState < this.history.length - 1) {
      this.processAction(this.currentState + 1, "history:redo", callback)
    }
  }

  public canUndo() {
    return this.currentState > 0
  }

  public canRedo() {
    return this.currentState < this.history.length - 1
  }

  public clearHistory() {
    this.history = []
    this.currentState = -1
    this.handler.canvas.fire("history:clear")
  }

  private processAction(stateIndex: number, event: keyof CanvasEvents, callback?: () => void) {
    this.isProcessing = true
    const history = this.history[stateIndex]
    if (history) {
      this.currentState = stateIndex
      this.loadHistory(history, event, callback)
    } else {
      this.isProcessing = false
    }
  }

  private saveAction() {
    if (this.isProcessing) return
    const json = this.nextAction()
    this.history = this.history.slice(0, this.currentState + 1)
    this.history.push(json)
    this.currentState = this.history.length - 1
    this.handler.canvas.fire("history:append", { json })
  }

  private nextAction() {
    return JSON.stringify(this.handler.canvas.toDatalessJSON(this.extraProps))
  }

  private loadHistory(history: HistoryAction, event: keyof CanvasEvents, callback?: () => void) {
    this.handler.canvas.loadFromJSON(history, () => {
      this.handler.canvas.requestRenderAll()
      this.handler.canvas.fire(event)
      this.isProcessing = false
      callback?.()
    })
  }
}

export default HistoryHandler
