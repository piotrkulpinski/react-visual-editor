import { fabric } from "fabric"
import type Editor from "../Editor"
import EditorPlugin from "../EditorPlugin"
import { SelectEvent, SelectMode } from "../eventType"
import { generateId, transformText } from "../utils/utils"
import { downFile } from "../utils/utils"

class ServersPlugin extends EditorPlugin {
  public selectedMode: SelectMode
  static pluginName = "ServersPlugin"
  static apis = [
    "insert",
    "loadJSON",
    "getJson",
    "dragAddItem",
    "saveJson",
    "saveSvg",
    "saveImg",
    "clear",
    "preview",
    "addImgByElement",
    "getImageExtension",
    "getSelectMode",
  ]
  static events = [SelectMode.ONE, SelectMode.MULTI, SelectEvent.CANCEL]
  // public hotkeys: string[] = ['left', 'right', 'down', 'up'];

  constructor(canvas: fabric.Canvas, editor: Editor) {
    super(canvas, editor)
    this.selectedMode = SelectMode.EMPTY
    this._initSelectEvent()
  }

  private _initSelectEvent() {
    this.canvas.on("selection:created", () => this._emitSelectEvent())
    this.canvas.on("selection:updated", () => this._emitSelectEvent())
    this.canvas.on("selection:cleared", () => this._emitSelectEvent())
  }

  private _emitSelectEvent() {
    if (!this.canvas) {
      throw TypeError("Not yet initialized")
    }

    const actives = this.canvas
      .getActiveObjects()
      .filter(item => !(item instanceof fabric.GuideLine)) // Filter out guide lines
    if (actives && actives.length === 1) {
      this.selectedMode = SelectMode.ONE
      this.editor.emit(SelectEvent.ONE, actives)
    } else if (actives && actives.length > 1) {
      this.selectedMode = SelectMode.MULTI
      this.editor.emit(SelectEvent.MULTI, actives)
    } else {
      this.editor.emit(SelectEvent.CANCEL)
    }
  }

  getSelectMode() {
    return String(this.selectedMode)
  }

  loadJSON(jsonFile: string, callback?: () => void) {
    // Ensure element has an id
    const temp = JSON.parse(jsonFile)

    for (const item of temp.objects) {
      item.id = item.id ?? generateId()
    }

    const json = JSON.stringify(temp)

    // Pre-load hook
    this.editor.hooksEntity.hookImportBefore.callAsync(json, () => {
      this.canvas.loadFromJSON(json, () => {
        this.canvas.renderAll()

        // Post-load hook
        this.editor.hooksEntity.hookImportAfter.callAsync(json, () => {
          this.canvas.renderAll()
          callback?.()
          this.editor.emit("loadJson")
        })
      })
    })
  }

  getJson() {
    return this.canvas.toJSON(["id", "gradientAngle", "selectable", "hasControls", "linkData"])
  }

  /**
   * @description: Drag to add to canvas
   * @param {Event} event
   * @param {Object} item
   */
  dragAddItem(item: fabric.Object, event?: DragEvent) {
    if (event) {
      const { left, top } = this.canvas.getSelectionElement().getBoundingClientRect()
      if (event.x < left || event.y < top || item.width === undefined) return

      const point = {
        x: event.x - left,
        y: event.y - top,
      }
      const pointerVpt = this.canvas.restorePointerVpt(point)
      item.left = pointerVpt.x - item.width / 2
      item.top = pointerVpt.y
    }
    const { width } = this._getSaveOption()
    width && item.scaleToWidth(width / 2)
    this.canvas.add(item)
    this.canvas.requestRenderAll()
  }

  async saveJson() {
    const dataUrl = this.getJson()
    // Convert text to textgroup to enable import editing
    transformText(dataUrl.objects)
    const fileStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataUrl, null, "\t"),
    )}`
    downFile(fileStr, "json")
  }

  saveSvg() {
    this.editor.hooksEntity.hookSaveBefore.callAsync("", () => {
      const option = this._getSaveSvgOption()
      const dataUrl = this.canvas.toSVG(option)
      const fileStr = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(dataUrl)}`
      this.editor.hooksEntity.hookSaveAfter.callAsync(fileStr, () => {
        downFile(fileStr, "svg")
      })
    })
  }

  saveImg() {
    this.editor.hooksEntity.hookSaveBefore.callAsync("", () => {
      const option = this._getSaveOption()
      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
      const dataUrl = this.canvas.toDataURL(option)
      this.editor.hooksEntity.hookSaveAfter.callAsync(dataUrl, () => {
        downFile(dataUrl, "png")
      })
    })
  }

  preview() {
    return new Promise(resolve => {
      this.editor.hooksEntity.hookSaveBefore.callAsync("", () => {
        const option = this._getSaveOption()
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
        this.canvas.renderAll()
        const dataUrl = this.canvas.toDataURL(option)
        this.editor.hooksEntity.hookSaveAfter.callAsync(dataUrl, () => {
          resolve(dataUrl)
        })
      })
    })
  }

  // Return workspace object
  _getWorkspace() {
    return this.canvas.getObjects().find(({ id }) => id === "workspace")
  }

  _getSaveSvgOption() {
    const { left: x, top: y, width, height } = this._getWorkspace() as fabric.Object

    return {
      width,
      height,
      viewBox: { x, y, width, height },
    }
  }

  _getSaveOption() {
    const { left, top, width, height } = this._getWorkspace() as fabric.Object

    return {
      name: "New Image",
      format: "png",
      quality: 1,
      width,
      height,
      left,
      top,
    }
  }

  addImgByElement(target: HTMLImageElement) {
    // const target = e.target as HTMLImageElement;
    const imgType = this.getImageExtension(target.src)
    if (imgType === "svg") {
      fabric.loadSVGFromURL(target.src, objects => {
        const item = fabric.util.groupSVGElements(objects, {
          shadow: "",
          fontFamily: "arial",
          id: generateId(),
          name: "svg元素",
        })
        this.dragAddItem(item)
      })
    } else {
      fabric.Image.fromURL(
        target.src,
        imgEl => {
          imgEl.set({
            left: 100,
            top: 100,
          })
          this.dragAddItem(imgEl)
        },
        { crossOrigin: "anonymous" },
      )
    }
  }

  getImageExtension(imageUrl: string) {
    const pathParts = imageUrl.split("/")
    const filename = pathParts[pathParts.length - 1]
    const fileParts = filename.split(".")
    return fileParts[fileParts.length - 1]
  }

  clear() {
    for (const item of this.canvas.getObjects()) {
      if (item.id !== "workspace") {
        this.canvas.remove(item)
      }
    }

    this.canvas.discardActiveObject()
    this.canvas.renderAll()
  }

  destroy() {
    console.log("pluginDestroy")
  }
}

export default ServersPlugin
