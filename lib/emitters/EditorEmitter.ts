import type { fabric } from "fabric"
import mitt from "mitt"

type EditorEvents = {
  "editor:load": fabric.Canvas
  "editor:destroy": fabric.Canvas
}

export const emitter = mitt<EditorEvents>()
