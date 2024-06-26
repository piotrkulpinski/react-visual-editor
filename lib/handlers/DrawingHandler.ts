import { HorizontalLineCoords, Rect, VerticalLineCoords } from "../utils/types"
import { Handler } from "./Handler"

type DrawLineOptions = {
  left: number
  top: number
  width: number
  height: number
  stroke?: string | CanvasGradient | CanvasPattern
  lineWidth?: number
}

type DrawTextOptions = {
  left: number
  top: number
  text: string
  fill?: string | CanvasGradient | CanvasPattern
  align?: CanvasTextAlign
  angle?: number
  fontSize?: number
}

type DrawRectOptions = {
  left: number
  top: number
  width: number
  height: number
  fill?: string | CanvasGradient | CanvasPattern
  stroke?: string
  strokeWidth?: number
}

type DrawMaskOptions = {
  isHorizontal: boolean
  left: number
  top: number
  width: number
  height: number
  backgroundColor: string
}

export class DrawingHandler {
  handler: Handler

  /**
   * Canvas context
   */
  ctx: CanvasRenderingContext2D

  constructor(handler: Handler) {
    this.handler = handler

    // Initialize canvas context
    this.ctx = this.handler.canvas.getContext()
  }

  /**
   * Draw a line
   * @param options Drawing options
   */
  public drawLine({ left, top, width, height, stroke, lineWidth }: DrawLineOptions) {
    this.ctx.save()
    this.ctx.beginPath()

    if (stroke) {
      this.ctx.strokeStyle = stroke
    }

    this.ctx.lineWidth = lineWidth ?? 1
    this.ctx.moveTo(left, top)
    this.ctx.lineTo(left + width, top + height)
    this.ctx.stroke()
    this.ctx.restore()
  }

  /**
   * Draw text
   * @param options Drawing options
   */
  public drawText({ left, top, text, fill, align, angle, fontSize }: DrawTextOptions) {
    this.ctx.save()

    if (fill) {
      this.ctx.fillStyle = fill
    }

    this.ctx.textAlign = align ?? "left"
    this.ctx.textBaseline = "top"
    this.ctx.font = `${fontSize ?? 9}px "Inter Variable", sans-serif`

    if (angle) {
      this.ctx.translate(left, top)
      this.ctx.rotate((Math.PI / 180) * angle)
      this.ctx.translate(-left, -top)
    }

    this.ctx.fillText(text, left, top)
    this.ctx.restore()
  }

  /**
   * Draw a rectangle
   * @param options Drawing options
   */
  public drawRect({ left, top, width, height, fill, stroke, strokeWidth }: DrawRectOptions) {
    this.ctx.save()
    this.ctx.beginPath()

    if (fill) {
      this.ctx.fillStyle = fill
    }

    this.ctx.rect(left, top, width, height)
    this.ctx.fill()

    if (stroke) {
      this.ctx.strokeStyle = stroke
      this.ctx.lineWidth = strokeWidth ?? 1
      this.ctx.stroke()
    }

    this.ctx.restore()
  }

  /**
   * Draw a mask
   * @param options Drawing options
   */
  public drawMask({ isHorizontal, left, top, width, height, backgroundColor }: DrawMaskOptions) {
    this.ctx.save()

    // Create a linear gradient object
    const fill = isHorizontal
      ? this.ctx.createLinearGradient(left, height / 2, left + width, height / 2)
      : this.ctx.createLinearGradient(width / 2, top, width / 2, height + top)

    fill.addColorStop(0, "rgba(255,255,255,0)")
    fill.addColorStop(0.33, backgroundColor)
    fill.addColorStop(0.67, backgroundColor)
    fill.addColorStop(1, "rgba(255,255,255,0)")

    // Create a rectangle
    this.drawRect({ left, top, width, height, fill })

    this.ctx.restore()
  }

  /**
   * Merge rectangles segments
   *
   * @param objects Array of Rectangles
   * @param isHorizontal
   */
  public mergeRects(objects: Rect[], isHorizontal: boolean) {
    const axis = isHorizontal ? "left" : "top"
    const length = isHorizontal ? "width" : "height"

    // Sort by size of axis first
    objects.sort((a, b) => a[axis] - b[axis])

    const mergedRects = []
    let currentRect = Object.assign({}, objects[0])

    for (const object of objects) {
      const line = Object.assign({}, object)

      // If the current line segment intersects with the next line segment, merge the width
      if (currentRect[axis] + currentRect[length] >= line[axis]) {
        currentRect[length] =
          Math.max(currentRect[axis] + currentRect[length], line[axis] + line[length]) -
          currentRect[axis]

        // If the current line segment does not intersect with the next line segment, add the current line segment to the result array and update the current line segment to the next one
      } else {
        mergedRects.push(currentRect)
        currentRect = Object.assign({}, line)
      }
    }

    // Add to the array
    mergedRects.push(currentRect)
    return mergedRects
  }

  /**
   * Merge overlapping lines
   *
   * @param lines Array of lines
   */
  public mergeLines<T extends VerticalLineCoords | HorizontalLineCoords>(lines: Set<T>): Set<T> {
    const mergedLines = new Set<T>()

    for (const line of lines) {
      const existingLine = [...mergedLines].find((mergedLine) =>
        "x" in line
          ? "x" in mergedLine && mergedLine.x === line.x
          : "y" in mergedLine && mergedLine.y === line.y
      )

      if (existingLine) {
        existingLine.start = Math.min(existingLine.start, line.start)
        existingLine.end = Math.max(existingLine.end, line.end)
      } else {
        mergedLines.add(line)
      }
    }

    return mergedLines
  }
}
