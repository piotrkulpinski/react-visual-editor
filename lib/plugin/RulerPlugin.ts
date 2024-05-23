import type { fabric } from "fabric"
import { createStore } from "zustand"
import type Editor from "../Editor"
import EditorPlugin from "../EditorPlugin"
import CanvasRuler from "../ruler/ruler"

type RulerStore = {
  isRulerEnabled: boolean
}

class RulerPlugin extends EditorPlugin {
  static pluginName = "RulerPlugin"
  static events = []
  static apis = [
    "hideGuideline",
    "showGuideline",
    "isRulerEnabled",
    "rulerEnable",
    "rulerDisable",
    "rulerToggle",
  ]

  store = createStore<RulerStore>(() => ({
    isRulerEnabled: true,
  }))

  private ruler: CanvasRuler | undefined

  constructor(canvas: fabric.Canvas, editor: Editor) {
    super(canvas, editor)

    // Initialize plugin
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
    this.ruler = new CanvasRuler(this.canvas, {
      enabled: this.store.getState().isRulerEnabled,
    })

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

    this.editor.store.setState({ isRulerEnabled: true })
  }

  rulerDisable() {
    this.ruler?.disable()

    this.editor.store.setState({ isRulerEnabled: false })
  }

  rulerToggle() {
    this.ruler?.toggle()

    this.editor.store.setState({
      isRulerEnabled: !this.editor.store.getState().isRulerEnabled,
    })
  }

  isRulerEnabled() {
    return this.editor.store.getState().isRulerEnabled
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
      return top > targetRect.top + 1 || top + height < targetRect.top + targetRect.height - 1
    }

    return left > targetRect.left + 1 || left + width < targetRect.left + targetRect.width - 1
  }
}

export default RulerPlugin
