import type { fabric } from "fabric"
import type Editor from "../Editor"
import EditorPlugin from "../EditorPlugin"
import initRuler from "../ruler"
import type CanvasRuler from "../ruler/ruler"

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
    this.ruler = initRuler(this.canvas)
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
}

export default RulerPlugin
