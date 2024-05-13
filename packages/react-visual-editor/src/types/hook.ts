import type * as fabric from "fabric"

export type EditorHook = {
  enabled?: boolean
  canvas?: fabric.Canvas | null | undefined
}
