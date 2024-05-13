import type * as fabric from "fabric"
import { useEditorStore } from "../store/editor"
import type { EditorPlugin } from "../utils/plugin"

export const useEditor = () => {
  const { canvas, getPlugin, setPlugin } = useEditorStore()

  const registerPlugin = (plugin: EditorPlugin, canvas: fabric.Canvas) => {
    if (getPlugin(plugin.name)) {
      return
    }

    plugin.init(canvas)
    setPlugin(plugin)

    for (const [actionName, action] of Object.entries(plugin.actions ?? {})) {
      console.log(`Registering action: ${actionName} for plugin: ${plugin.name}`)
      // Further implementation for registering or using actions within the application
    }
  }

  return {
    registerPlugin,
  }
}
