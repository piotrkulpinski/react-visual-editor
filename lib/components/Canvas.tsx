import { fabric } from "fabric"
import {
  type HTMLAttributes,
  createRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react"
import { v4 as uuid } from "uuid"
import Handler from "../handlers/Handler"

type CanvasProps = HTMLAttributes<HTMLDivElement> & {
  options?: fabric.ICanvasOptions
}

export const Canvas = forwardRef<Handler, CanvasProps>(({ options, ...props }, ref) => {
  const containerRef = createRef<HTMLDivElement>()
  const [handler, setHandler] = useState<Handler>()

  const canvasOptions = Object.assign(
    {
      preserveObjectStacking: true,
      width: 300,
      height: 150,
      selection: true,
      defaultCursor: "default",
    },
    options,
  )

  useEffect(() => {
    const canvas = new fabric.Canvas("canvas", canvasOptions)

    canvas.setDimensions({
      width: containerRef.current?.clientWidth ?? 0,
      height: containerRef.current?.clientHeight ?? 0,
    })

    const handlerInstance = new Handler({
      id: uuid(),
      canvas,
      canvasOptions,
      container: containerRef.current as HTMLDivElement,
    })

    setHandler(handlerInstance)

    // Return function to destroy handler
    return () => {
      handlerInstance.destroy()
    }
  }, [])

  // Handler ref
  useImperativeHandle(ref, () => handler as Handler)

  return (
    <div ref={containerRef} {...props}>
      <canvas id="canvas" />
    </div>
  )
})
