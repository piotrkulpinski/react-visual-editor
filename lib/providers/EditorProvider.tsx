import type { ICanvasOptions } from "fabric/fabric-impl"
import {
  type PropsWithChildren,
  type RefObject,
  createContext,
  useContext,
  useRef,
  useState,
} from "react"
import { emitter } from "../emitters/EditorEmitter"
import { EditorWorkspaceProvider } from "./EditorWorkspaceProvider"

export type EditorContext = {
  canvasRef?: RefObject<HTMLDivElement> | null
  options?: ICanvasOptions
  canvas?: fabric.Canvas
  onLoad?: (canvas: fabric.Canvas) => void
  onDestroy?: (canvas: fabric.Canvas) => void
}

const EditorContext = createContext<EditorContext>({} as EditorContext)

type EditorProviderProps = PropsWithChildren<{
  options?: ICanvasOptions
}>

export const EditorProvider = ({ children, options }: EditorProviderProps) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas>()

  const onLoad = (canvas: fabric.Canvas) => {
    setCanvas(canvas)

    canvas.setDimensions({
      width: canvasRef.current?.clientWidth ?? 0,
      height: canvasRef.current?.clientHeight ?? 0,
    })

    emitter.emit("editor:load", canvas)
  }

  const onDestroy = (canvas: fabric.Canvas) => {
    emitter.emit("editor:destroy", canvas)
  }

  return (
    <EditorContext.Provider value={{ canvasRef, options, canvas, onLoad, onDestroy }}>
      <EditorWorkspaceProvider>{children}</EditorWorkspaceProvider>
    </EditorContext.Provider>
  )
}

export const useEditor = () => {
  const context = useContext(EditorContext)

  if (!context) {
    throw new Error("Editor context is not available")
  }

  return context
}
