import type { fabric } from "fabric"
import { type PropsWithChildren, createContext, useContext } from "react"
import type Editor from "../../lib"

export type EditorContext = {
  fabric: typeof fabric
  editor: Editor
}

const EditorContext = createContext<EditorContext>({} as EditorContext)

type EditorProviderProps = PropsWithChildren<EditorContext>

export const EditorProvider = ({ fabric, editor, ...props }: EditorProviderProps) => {
  return <EditorContext.Provider value={{ fabric, editor }} {...props} />
}

export const useEditor = () => {
  const context = useContext(EditorContext)

  if (!context) {
    throw new Error("Editor context is not available")
  }

  return context
}
