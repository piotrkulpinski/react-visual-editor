import * as fabric from "fabric"
import { type HTMLAttributes, useCallback, useRef } from "react"
import { useEditor } from "../hooks/useEditor"
import WorkspacePlugin from "../plugins/WorkspacePlugin"
import { useEditorStore } from "../store/editor"
import { Canvas } from "./Canvas"

type WorkspaceProps = HTMLAttributes<HTMLDivElement> & {}

export const Editor = ({ ...props }: WorkspaceProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<fabric.Canvas>(null)
  const { setCanvas } = useEditorStore()
  const { registerPlugin } = useEditor()

  const onLoad = useCallback(
    (canvas: fabric.Canvas) => {
      canvas.setDimensions({
        width: ref.current?.clientWidth ?? 0,
        height: ref.current?.clientHeight ?? 0,
      })

      const textValue = "fabric.js sandbox"
      const text = new fabric.Textbox(textValue, {
        originX: "center",
        top: 240,
        textAlign: "center",
        styles: fabric.util.stylesFromArray(
          [{ style: { fontWeight: "bold", fontSize: 64 }, start: 0, end: 9 }],
          textValue,
        ),
      })

      canvas.add(text)
      canvas.centerObjectH(text)

      // Set the canvas in the store
      setCanvas(canvas)

      // Register plugins
      registerPlugin(WorkspacePlugin, canvas)
    },
    [canvasRef],
  )

  return (
    <div ref={ref} {...props}>
      <Canvas ref={canvasRef} onLoad={onLoad} />
    </div>
  )
}
