import * as fabric from "fabric"
import { type HTMLAttributes, forwardRef, useEffect, useRef } from "react"

const DEV_MODE = process.env.NODE_ENV === "development"

declare global {
  var canvas: fabric.Canvas | undefined
}

type CanvasProps = Omit<HTMLAttributes<HTMLCanvasElement>, "onLoad"> & {
  onLoad?: (canvas: fabric.Canvas) => void
}

export const Canvas = forwardRef<fabric.Canvas, CanvasProps>(({ onLoad, ...props }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) {
      return
    }

    const canvas = new fabric.Canvas(canvasRef.current)

    if (DEV_MODE) {
      window.canvas = canvas
    }

    if (typeof ref === "function") {
      ref(canvas)
    } else if (typeof ref === "object" && ref) {
      ref.current = canvas
    }

    // it is crucial `onLoad` is a dependency of this effect
    // to ensure the canvas is disposed and re-created if it changes
    onLoad?.(canvas)

    return () => {
      if (DEV_MODE) {
        // biome-ignore lint/performance/noDelete: delete is needed
        delete window.canvas
      }

      if (typeof ref === "function") {
        ref(null)
      } else if (typeof ref === "object" && ref) {
        ref.current = null
      }

      // `dispose` is async
      // however it runs a sync DOM cleanup
      // its async part ensures rendering has completed
      // and should not affect react
      canvas.dispose()
    }
  }, [canvasRef, onLoad])

  return <canvas ref={canvasRef} {...props} />
})
