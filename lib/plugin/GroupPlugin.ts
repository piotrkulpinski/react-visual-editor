import type { fabric } from "fabric"
import type Editor from "../Editor"
import { generateId } from "../utils/utils"

class GroupPlugin {
  public canvas: fabric.Canvas
  public editor: Editor
  static pluginName = "GroupPlugin"
  static apis = ["unGroup", "group"]
  constructor(canvas: fabric.Canvas, editor: Editor) {
    this.canvas = canvas
    this.editor = editor
  }

  // 拆分组
  unGroup() {
    const activeObject = this.canvas.getActiveObject() as fabric.Group
    if (!activeObject) return
    // 先获取当前选中的对象，然后打散
    const activeObjectList = activeObject.getObjects()
    activeObject.toActiveSelection()
    for (const item of activeObjectList) {
      item.set("id", generateId())
    }
    this.canvas.discardActiveObject().renderAll()
  }

  group() {
    // 组合元素
    const activeObj = this.canvas.getActiveObject() as fabric.ActiveSelection
    if (!activeObj) return
    const activegroup = activeObj.toGroup()
    const objectsInGroup = activegroup.getObjects()
    activegroup.clone((newgroup: fabric.Group) => {
      newgroup.set("id", generateId())
      this.canvas.remove(activegroup)
      for (const object of objectsInGroup) {
        this.canvas.remove(object)
      }
      this.canvas.add(newgroup)
      this.canvas.setActiveObject(newgroup)
    })
  }

  contextMenu() {
    const activeObject = this.canvas.getActiveObject()
    if (activeObject && activeObject.type === "group") {
      return [
        {
          text: "拆分组合",
          hotkey: "Ctrl+V",
          disabled: false,
          onclick: () => this.unGroup(),
        },
      ]
    }

    if (this.canvas.getActiveObjects().length > 1) {
      return [
        {
          text: "组合",
          hotkey: "Ctrl+V",
          disabled: false,
          onclick: () => this.group(),
        },
      ]
    }
  }
  destroy() {
    console.log("pluginDestroy")
  }
}

export default GroupPlugin
