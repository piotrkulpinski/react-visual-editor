import type { fabric } from "fabric"
import type Editor from "../Editor"
import EditorPlugin from "../EditorPlugin"

class DeleteHotKeyPlugin extends EditorPlugin {
  public canvas: fabric.Canvas
  public editor: Editor
  static pluginName = "DeleteHotKeyPlugin"
  static apis = ["del"]
  public hotkeys: string[] = ["backspace"]

  constructor(canvas: fabric.Canvas, editor: Editor) {
    super(canvas, editor)
    this.canvas = canvas
    this.editor = editor
  }

  // Shortcut key extension callback
  hotkeyEvent(eventName: string, { type }: KeyboardEvent) {
    if (eventName === "backspace" && type === "keydown") {
      this.del()
    }
  }

  del() {
    const activeObject = this.canvas.getActiveObjects()

    if (activeObject) {
      activeObject.map(item => this.canvas.remove(item))
      this.canvas.requestRenderAll()
      // this.canvas.discardActiveObject()
    }
  }

  contextMenu() {
    const activeObject = this.canvas.getActiveObject()

    if (activeObject) {
      return [
        null,
        {
          text: "删除",
          hotkey: "Ctrl+V",
          disabled: false,
          onclick: () => this.del(),
        },
      ]
    }
  }
}

export default DeleteHotKeyPlugin
