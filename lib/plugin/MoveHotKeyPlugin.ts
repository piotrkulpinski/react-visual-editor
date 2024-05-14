/*
 * @Author: 秦少卫
 * @Date: 2023-06-20 12:52:09
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-04-10 17:32:31
 * @Description: 移动快捷键
 */

import type { fabric } from "fabric"
import type Editor from "../Editor"
import EditorPlugin from "../EditorPlugin"

class MoveHotKeyPlugin extends EditorPlugin {
  public canvas: fabric.Canvas
  public editor: Editor
  static pluginName = "MoveHotKeyPlugin"
  public hotkeys = [
    "left",
    "right",
    "down",
    "up",
    "shift+left",
    "shift+right",
    "shift+down",
    "shift+up",
  ]

  constructor(canvas: fabric.Canvas, editor: Editor) {
    super(canvas, editor)
    this.canvas = canvas
    this.editor = editor
  }

  // Shortcut key expansion callback
  hotkeyEvent(eventName: string, { type, key, shiftKey }: KeyboardEvent) {
    if (type === "keydown") {
      const activeObject = this.canvas.getActiveObject()
      const increment = shiftKey ? 10 : 1

      switch (key) {
        case "ArrowLeft":
          if (activeObject?.left === undefined) return
          activeObject.set("left", activeObject.left - increment)
          break
        case "ArrowRight":
          if (activeObject?.left === undefined) return
          activeObject.set("left", activeObject.left + increment)
          break
        case "ArrowDown":
          if (activeObject?.top === undefined) return
          activeObject.set("top", activeObject.top + increment)
          break
        case "ArrowUp":
          if (activeObject?.top === undefined) return
          activeObject.set("top", activeObject.top - increment)
          break
      }

      this.canvas.renderAll()
    }
  }
}

export default MoveHotKeyPlugin
