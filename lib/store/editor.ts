import type * as fabric from "fabric"
import { create } from "zustand"
import type { EditorAction, EditorPlugin } from "../utils/plugin"

export type EditorStore = {
  canvas: fabric.Canvas | null
  setCanvas: (canvas: fabric.Canvas | null) => void

  plugins: EditorPlugin[]
  getPlugin: (name: string) => EditorPlugin | undefined
  setPlugin: (plugin: EditorPlugin) => void

  actions: EditorAction
  setAction: (action: EditorAction) => void
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  canvas: null,
  setCanvas: canvas => set(() => ({ canvas })),

  plugins: [],
  getPlugin: name => get().plugins.find(plugin => plugin.name === name),
  setPlugin: plugin => set(() => ({ plugins: [...get().plugins, plugin] })),

  actions: {},
  setAction: action => set(() => ({ actions: { ...get().actions, ...action } })),
}))
