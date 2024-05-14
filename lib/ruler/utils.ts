import type { Rect } from "./ruler"

/**
 * Calculate the spacing between rulers
 * @param zoom Scaling ratio
 * @returns Return the calculated spacing between rulers
 */
const getGap = (zoom: number) => {
  const zooms = [0.02, 0.03, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 18]
  const gaps = [5000, 2500, 1000, 500, 250, 100, 50, 25, 10, 5, 2]

  let i = 0
  while (i < zooms.length && (zooms[i] ?? 0) < zoom) {
    i++
  }

  return gaps[i - 1] || 5000
}

/**
 * Merge line segments
 * @param rect Array of Rectangles
 * @param isHorizontal
 * @returns Merged array of Rectangles
 */
const mergeLines = (rect: Rect[], isHorizontal: boolean) => {
  const axis = isHorizontal ? "left" : "top"
  const length = isHorizontal ? "width" : "height"
  // Sort by size of axis first
  rect.sort((a, b) => a[axis] - b[axis])
  const mergedLines = []
  let currentLine = Object.assign({}, rect[0])
  for (const item of rect) {
    const line = Object.assign({}, item)
    if (currentLine[axis] + currentLine[length] >= line[axis]) {
      // If the current line segment intersects with the next line segment, merge the width
      currentLine[length] =
        Math.max(currentLine[axis] + currentLine[length], line[axis] + line[length]) -
        currentLine[axis]
    } else {
      // If the current line segment does not intersect with the next line segment, add the current line segment to the result array and update the current line segment to the next one
      mergedLines.push(currentLine)
      currentLine = Object.assign({}, line)
    }
  }
  // Add to the array
  mergedLines.push(currentLine)
  return mergedLines
}

const drawLine = (
  ctx: CanvasRenderingContext2D,
  options: {
    left: number
    top: number
    width: number
    height: number
    stroke?: string | CanvasGradient | CanvasPattern
    lineWidth?: number
  },
) => {
  ctx.save()
  const { left, top, width, height, stroke, lineWidth } = options
  ctx.beginPath()
  if (stroke) {
    ctx.strokeStyle = stroke
  }
  ctx.lineWidth = lineWidth ?? 1
  ctx.moveTo(left, top)
  ctx.lineTo(left + width, top + height)
  ctx.stroke()
  ctx.restore()
}

const drawText = (
  ctx: CanvasRenderingContext2D,
  options: {
    left: number
    top: number
    text: string
    fill?: string | CanvasGradient | CanvasPattern
    align?: CanvasTextAlign
    angle?: number
    fontSize?: number
  },
) => {
  ctx.save()
  const { left, top, text, fill, align, angle, fontSize } = options
  if (fill) {
    ctx.fillStyle = fill
  }
  ctx.textAlign = align ?? "left"
  ctx.textBaseline = "top"
  ctx.font = `${fontSize ?? 9}px "Inter Variable", sans-serif`
  if (angle) {
    ctx.translate(left, top)
    ctx.rotate((Math.PI / 180) * angle)
    ctx.translate(-left, -top)
  }
  ctx.fillText(text, left, top)
  ctx.restore()
}

const drawRect = (
  ctx: CanvasRenderingContext2D,
  options: {
    left: number
    top: number
    width: number
    height: number
    fill?: string | CanvasGradient | CanvasPattern
    stroke?: string
    strokeWidth?: number
  },
) => {
  ctx.save()
  const { left, top, width, height, fill, stroke, strokeWidth } = options
  ctx.beginPath()
  if (fill) {
    ctx.fillStyle = fill
  }
  ctx.rect(left, top, width, height)
  ctx.fill()
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = strokeWidth ?? 1
    ctx.stroke()
  }
  ctx.restore()
}

const drawMask = (
  ctx: CanvasRenderingContext2D,
  options: {
    isHorizontal: boolean
    left: number
    top: number
    width: number
    height: number
    backgroundColor: string
  },
) => {
  ctx.save()
  const { isHorizontal, left, top, width, height, backgroundColor } = options
  // Create a linear gradient object
  const fill = isHorizontal
    ? ctx.createLinearGradient(left, height / 2, left + width, height / 2)
    : ctx.createLinearGradient(width / 2, top, width / 2, height + top)

  fill.addColorStop(0, "rgba(255,255,255,0)")
  fill.addColorStop(0.33, backgroundColor)
  fill.addColorStop(0.67, backgroundColor)
  fill.addColorStop(1, "rgba(255,255,255,0)")

  // Create a rectangle
  drawRect(ctx, { left, top, width, height, fill })

  ctx.restore()
}

export { getGap, mergeLines, drawRect, drawText, drawLine, drawMask }
