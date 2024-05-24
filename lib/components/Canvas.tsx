/** eslint-disable react-hooks/exhaustive-deps */
import { Canvas as FabricCanvas, CanvasOptions } from "fabric"
import {
  type HTMLAttributes,
  createRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useRef,
} from "react"
import { v4 as uuid } from "uuid"
import Handler from "../handlers/Handler"

type CanvasProps = HTMLAttributes<HTMLDivElement> & {
  options?: Partial<CanvasOptions>
}

export const Canvas = forwardRef<Handler, CanvasProps>(({ options, ...props }, ref) => {
  const containerRef = createRef<HTMLDivElement>()
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [handler, setHandler] = useState<Handler>()

  const canvasOptions = Object.assign(
    {
      preserveObjectStacking: true,
      width: 300,
      height: 150,
      selection: true,
      defaultCursor: "default",
    },
    options
  )

  useEffect(() => {
    const canvas = new FabricCanvas("canvas", canvasOptions)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handler ref
  useImperativeHandle(ref, () => handler as Handler)

  return (
    <div ref={containerRef} style={{ outline: "none" }} {...props}>
      <canvas id="canvas" style={{ outline: "none" }} />
    </div>
  )
})
