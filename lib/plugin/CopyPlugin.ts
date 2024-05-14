import type { fabric } from "fabric"
import type Editor from "../Editor"
import EditorPlugin from "../EditorPlugin"
import { generateId } from "../utils/utils"

class CopyPlugin extends EditorPlugin {
  public canvas: fabric.Canvas
  public editor: Editor
  static pluginName = "CopyPlugin"
  static apis = ["clone"]
  public hotkeys: string[] = ["ctrl+v", "ctrl+c"]
  private cache: null | fabric.ActiveSelection | fabric.Object

  constructor(canvas: fabric.Canvas, editor: Editor) {
    super(canvas, editor)
    this.canvas = canvas
    this.editor = editor
    this.cache = null
    this.initPaste()
  }

  // Multiple object copying
  _copyActiveSelection(activeObject: fabric.Object) {
    // Spacing setting
    const grid = 10
    const canvas = this.canvas
    activeObject?.clone((cloned: fabric.Object) => {
      // Cloning again, dealing with selecting multiple objects
      cloned.clone((clonedObj: fabric.ActiveSelection) => {
        canvas.discardActiveObject()
        if (clonedObj.left === undefined || clonedObj.top === undefined) return
        // Reassign the cloned canvas
        clonedObj.canvas = canvas
        // Setting position information
        clonedObj.set({
          left: clonedObj.left + grid,
          top: clonedObj.top + grid,
          evented: true,
          id: generateId(),
        })
        clonedObj.forEachObject((obj: fabric.Object) => {
          obj.id = generateId()
          canvas.add(obj)
        })
        // Resolve the issue of not being able to select
        clonedObj.setCoords()
        canvas.setActiveObject(clonedObj)
        canvas.requestRenderAll()
      })
    })
  }

  // Copying a single object
  _copyObject(activeObject: fabric.Object) {
    // Spacing setting
    const grid = 10
    const canvas = this.canvas
    activeObject?.clone((cloned: fabric.Object) => {
      if (cloned.left === undefined || cloned.top === undefined) return
      canvas.discardActiveObject()
      // Setting position information
      cloned.set({
        left: cloned.left + grid,
        top: cloned.top + grid,
        evented: true,
        id: generateId(),
      })
      canvas.add(cloned)
      canvas.setActiveObject(cloned)
      canvas.requestRenderAll()
    })
  }

  // Copy elements
  clone(paramsActiveObeject?: fabric.ActiveSelection | fabric.Object) {
    const activeObject = paramsActiveObeject || this.canvas.getActiveObject()
    if (!activeObject) return
    if (activeObject?.type === "activeSelection") {
      this._copyActiveSelection(activeObject)
    } else {
      this._copyObject(activeObject)
    }
  }

  // Shortcut extension callback
  hotkeyEvent(eventName: string, { type }: KeyboardEvent) {
    if (eventName === "ctrl+c" && type === "keydown") {
      const activeObject = this.canvas.getActiveObject()
      this.cache = activeObject
    }

    if (eventName === "ctrl+v" && type === "keydown") {
      if (this.cache) {
        this.clone(this.cache)
      }
    }
  }

  contextMenu() {
    const activeObject = this.canvas.getActiveObject()

    if (activeObject) {
      return [{ text: "Clone", hotkey: "Ctrl+V", disabled: false, onclick: () => this.clone() }]
    }
  }

  destroy() {
    console.log("pluginDestroy")
    window.removeEventListener("paste", this.pasteListener)
  }

  initPaste() {
    window.addEventListener("paste", this.pasteListener)
  }

  async pasteListener(event: ClipboardEvent) {
    const canvas = this.canvas
    if (document.activeElement === document.body) {
      event.preventDefault() // Preventing default paste behavior
    } else {
      return
    }

    // const items = event.clipboardData?.items ?? []
    // const fileAccept = ".pdf,.psd,.cdr,.ai,.svg,.jpg,.jpeg,.png,.webp,.json"

    // for (const item of items) {
    //   if (item.kind === "file") {
    //     const file = item.getAsFile()
    //     const curFileSuffix: string | undefined = file?.name.split(".").pop()

    //     if (!fileAccept.split(",").includes(`.${curFileSuffix}`)) return

    //     if (curFileSuffix === "svg") {
    //       const svgFile = await getImgStr(file)
    //       if (!svgFile) throw new Error("file is undefined")
    //       fabric.loadSVGFromURL(svgFile as string, (objects, options) => {
    //         const item = fabric.util.groupSVGElements(objects, {
    //           ...options,
    //           name: "defaultSVG",
    //           id: generateId(),
    //         })
    //         canvas.add(item).centerObject(item).renderAll()
    //       })
    //     }

    //     if (file && item.type.indexOf("image/") === 0) {
    //       // This is an image file
    //       const imageUrl = URL.createObjectURL(file)
    //       const imgEl = document.createElement("img")
    //       imgEl.src = imageUrl
    //       // Insert into page
    //       document.body.appendChild(imgEl)
    //       imgEl.onload = () => {
    //         // Create image object
    //         const imgInstance = new fabric.Image(imgEl, {
    //           id: generateId(),
    //           name: "图片1",
    //           left: 100,
    //           top: 100,
    //         })
    //         // Set scaling
    //         canvas.add(imgInstance)
    //         canvas.setActiveObject(imgInstance)
    //         canvas.renderAll()
    //         // Delete image elements on the page
    //         imgEl.remove()
    //       }
    //     }
    //   } else if (item.kind === "string" && item.type.indexOf("text/plain") === 0) {
    //     // Text data
    //     item.getAsString((text: any) => {
    //       // Insert into text box
    //       const activeObject = canvas.getActiveObject() as fabric.Textbox
    //       // If text is active, insert copied content at the corresponding cursor position
    //       if (
    //         activeObject &&
    //         (activeObject.type === "textbox" || activeObject.type === "i-text") &&
    //         activeObject.text
    //       ) {
    //         const cursorPosition = activeObject.selectionStart
    //         const textBeforeCursorPosition = activeObject.text.substring(0, cursorPosition)
    //         const textAfterCursorPosition = activeObject.text.substring(cursorPosition as number)

    //         // Update text object text
    //         activeObject.set("text", textBeforeCursorPosition + text + textAfterCursorPosition)

    //         // Reset cursor position
    //         activeObject.selectionStart = cursorPosition + text.length
    //         activeObject.selectionEnd = cursorPosition + text.length

    //         // Rerender canvas to display updated text
    //         activeObject.dirty = true
    //         canvas.renderAll()
    //       } else {
    //         const fabricText = new fabric.IText(text, {
    //           left: 100,
    //           top: 100,
    //           fontSize: 80,
    //           id: generateId(),
    //         })
    //         canvas.add(fabricText)
    //         canvas.setActiveObject(fabricText)
    //       }
    //     })
    //   }
    // }

    // if (!items.length) {
    //   if (this.cache) {
    //     this.clone(this.cache)
    //   }
    // }
  }
}

export default CopyPlugin
