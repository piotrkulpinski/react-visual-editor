import type * as fabric from "fabric"

export type EditorAction = Record<string, () => void>

export interface EditorPlugin {
  /**
   * The name of the plugin.
   */
  name: string

  /**
   * The initializing function of the plugin.
   */
  init: (canvas: fabric.Canvas | null) => void

  /**
   * The list of actions that the plugin provides.
   */
  actions?: EditorAction
}

export const registerPlugin = (plugin: EditorPlugin) => plugin
