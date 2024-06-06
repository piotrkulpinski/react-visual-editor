/** eslint-disable react-hooks/exhaustive-deps */
import { Canvas as FabricCanvas, CanvasOptions } from "fabric"
import {
  type HTMLAttributes,
  createRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react"
import { generateId } from "../utils/helpers"
import { Handler } from "../handlers/Handler"

type CanvasProps = HTMLAttributes<HTMLDivElement> & {
  options?: Partial<CanvasOptions>
}

export const Canvas = forwardRef<Handler, CanvasProps>(({ options, ...props }, ref) => {
  const containerRef = createRef<HTMLDivElement>()
  const [handler, setHandler] = useState<Handler>()

  useEffect(() => {
    const canvas = new FabricCanvas("canvas", {
      width: 300,
      height: 150,
      defaultCursor: "default",
      preserveObjectStacking: true,
      controlsAboveOverlay: true,
      uniformScaling: false,
      ...options,
    })

    canvas.setDimensions({
      width: containerRef.current?.clientWidth ?? 0,
      height: containerRef.current?.clientHeight ?? 0,
    })

    const handlerInstance = new Handler({
      id: generateId(),
      canvas,
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
    <div ref={containerRef} style={{ outline: "none" }} {...props}>
      <canvas id="canvas" style={{ outline: "none" }} />
    </div>
  )
})
