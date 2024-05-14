import { fabric } from "fabric"
import type Editor from "../Editor"
import "fabric-history"

type extendCanvas = {
  undo: () => void
  redo: () => void
  clearHistory: () => void
  historyUndo: any[]
  historyRedo: any[]
}

class HistoryPlugin {
  public canvas: fabric.Canvas & extendCanvas
  public editor: Editor
  static pluginName = "HistoryPlugin"
  static apis = ["undo", "redo"]
  static events = ["historyUpdate"]
  public hotkeys: string[] = ["ctrl+z", "ctrl+shift+z", "⌘+z", "⌘+shift+z"]

  constructor(canvas: fabric.Canvas & extendCanvas, editor: Editor) {
    this.canvas = canvas
    this.editor = editor

    fabric.Canvas.prototype._historyNext = () => {
      return this.editor.getJson()
    }

    this._init()
  }

  _init() {
    this.canvas.on("history:append", () => {
      this.historyUpdate()
    })

    window.addEventListener("beforeunload", e => {
      if (this.canvas.historyUndo.length > 0) {
        // Cancel the event
        e.preventDefault()

        // Included for legacy support, e.g. Chrome/Edge < 119
        e.returnValue = "Confirm Exit"
      }
    })
  }

  historyUpdate() {
    const { historyUndo, historyRedo } = this.canvas
    this.editor.emit("historyUpdate", historyUndo.length, historyRedo.length)
  }

  // After importing the template, clear the history cache.
  hookImportAfter() {
    this.canvas.clearHistory()
    this.historyUpdate()
    return Promise.resolve()
  }

  undo() {
    // fix When the history is rolled back to the first step, the canvas area can be dragged.
    if (this.canvas.historyUndo.length === 1) {
      this.editor.clear()
      this.canvas.clearHistory()
      return
    }
    this.canvas.undo()
    this.historyUpdate()
  }

  redo() {
    this.canvas.redo()
    this.historyUpdate()
  }

  // Shortcut key extension callback
  hotkeyEvent(eventName: string, { type }: KeyboardEvent) {
    if (type === "keydown") {
      switch (eventName) {
        case "ctrl+z":
        case "⌘+z":
          this.undo()
          break
        case "ctrl+shift+z":
        case "⌘+shift+z":
          this.redo()
          break
      }
    }
  }
}

export default HistoryPlugin
