import type { fabric } from "fabric"
import type Editor from "../Editor"
import EditorPlugin from "../EditorPlugin"
import CanvasRuler from "../ruler/ruler"

class RulerPlugin extends EditorPlugin {
  static pluginName = "RulerPlugin"
  static apis = [
    "hideGuideline",
    "showGuideline",
    "isRulerEnabled",
    "rulerEnable",
    "rulerDisable",
    "rulerToggle",
  ]

  private ruler: CanvasRuler | undefined

  constructor(canvas: fabric.Canvas, editor: Editor) {
    super(canvas, editor)
    this.init()
  }

  hookSaveBefore() {
    return new Promise(resolve => {
      this.hideGuideline()
      resolve(true)
    })
  }

  hookSaveAfter() {
    return new Promise(resolve => {
      this.showGuideline()
      resolve(true)
    })
  }

  init() {
    this.ruler = new CanvasRuler(this.canvas)

    this.canvas.on("guideline:moving", ({ target }) => {
      if (this.isRectOut(this.editor.workspace, target)) {
        target.moveCursor = "not-allowed"
      }
    })

    this.canvas.on("guideline:mouseup", ({ target }) => {
      if (this.isRectOut(this.editor.workspace, target)) {
        this.canvas.remove(target)
        this.canvas.setCursor(this.canvas.defaultCursor ?? "default")
      }
    })
  }

  hideGuideline() {
    this.ruler?.hideGuideline()
  }

  showGuideline() {
    this.ruler?.showGuideline()
  }

  rulerEnable() {
    this.ruler?.enable()
  }

  rulerDisable() {
    this.ruler?.disable()
  }

  rulerToggle() {
    this.ruler?.toggle()
  }

  isRulerEnabled() {
    return this.ruler?.options.enabled ?? false
  }

  /**
   * Check if the target is outside the object rectangle
   * @param object
   * @param target
   * @returns
   */
  isRectOut({ top, height, left, width }: fabric.Object, target: fabric.GuideLine): boolean {
    const targetRect = target.getBoundingRect(true, true)

    if (top === undefined || height === undefined || left === undefined || width === undefined) {
      return false
    }

    if (target.isHorizontal()) {
      console.log(targetRect)
      return top > targetRect.top + 1 || top + height < targetRect.top + targetRect.height - 1
    }

    return left > targetRect.left + 1 || left + width < targetRect.left + targetRect.width - 1
  }
}

export default RulerPlugin
