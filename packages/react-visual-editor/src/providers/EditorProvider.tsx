import { createContext, useContext } from "react"
import { type EditorStore, useEditorStore } from "../store/editor"

export const EditorContext = createContext<EditorStore | null>(null)

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const store = useEditorStore()

  return <EditorContext.Provider value={store}>{children}</EditorContext.Provider>
}

export const useEditor = () => {
  const editor = useContext(EditorContext)

  if (!editor) {
    throw new Error("Editor context is not available")
  }

  return editor
}
