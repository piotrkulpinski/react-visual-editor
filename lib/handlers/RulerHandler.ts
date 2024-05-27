import type { Rect, RulerOptions } from "../utils/types"
import type Handler from "./Handler"

export const defaultRulerOptions: RulerOptions = {
  ruleSize: 20,
  fontSize: 9,
  backgroundColor: "#fff",
  borderColor: "#e5e5e5",
  highlightColor: "#007fff",
  textColor: "#888888",
  scaleColor: "#d4d4d4",
}

type RulerDrawOptions = {
  isHorizontal: boolean
  rulerLength: number
  startCalibration: number
}

class RulerHandler {
  handler: Handler

  /**
   * Caching event handlers
   */
  private eventHandler = {
    render: this.render.bind(this),
  }

  constructor(handler: Handler) {
    this.handler = handler

    // Bind events
    // TODO: Unbind events on destroy
    this.handler.canvas.on("after:render", this.eventHandler.render)
  }

  /**
   * Render the vertical and horizontal rulers
   */
  public render() {
    const { ruleSize, backgroundColor } = this.handler.rulerOptions

    const vpt = this.handler.canvas.viewportTransform
    if (!vpt) return

    // Horizontal ruler
    this.draw({
      isHorizontal: true,
      rulerLength: this.getSize().width,
      startCalibration: -(vpt[4] && vpt[0] ? vpt[4] / vpt[0] : 0),
    })

    // Vertical ruler
    this.draw({
      isHorizontal: false,
      rulerLength: this.getSize().height,
      startCalibration: -(vpt[5] && vpt[3] ? vpt[5] / vpt[3] : 0),
    })

    // A mask in the top-left corner
    this.handler.drawingHandler.drawMask({
      isHorizontal: true,
      left: -10,
      top: -10,
      width: ruleSize * 2 + 10,
      height: ruleSize + 10,
      backgroundColor: backgroundColor,
    })

    this.handler.drawingHandler.drawMask({
      isHorizontal: false,
      left: -10,
      top: -10,
      width: ruleSize + 10,
      height: ruleSize * 2 + 10,
      backgroundColor: backgroundColor,
    })
  }

  /**
   * Draw the ruler
   * @param options - Ruler drawing options
   */
  private draw({ isHorizontal, rulerLength, startCalibration }: RulerDrawOptions) {
    const { ruleSize, backgroundColor, borderColor, scaleColor, textColor, fontSize } =
      this.handler.rulerOptions

    const size = this.getSize()
    const zoom = this.getZoom()
    const gap = this.getGap(zoom)
    const unitLength = rulerLength / zoom
    const startValue = Math[startCalibration > 0 ? "floor" : "ceil"](startCalibration / gap) * gap
    const startOffset = startValue - startCalibration

    this.handler.drawingHandler.drawRect({
      left: 0,
      top: 0,
      width: isHorizontal ? size.width : ruleSize,
      height: isHorizontal ? ruleSize : size.height,
      fill: backgroundColor,
      stroke: borderColor,
    })

    // Display ruler text
    for (let i = 0; i + startOffset <= Math.ceil(unitLength); i += gap) {
      const position = (startOffset + i) * zoom
      const textValue = `${startValue + i}`
      const textLength = (10 * textValue.length) / 4

      const textX = isHorizontal ? position - textLength - 1 : ruleSize / 2 - fontSize / 2 - 2
      const textY = isHorizontal ? ruleSize / 2 - fontSize / 2 - 2 : position + textLength

      this.handler.drawingHandler.drawText({
        text: textValue,
        left: textX,
        top: textY,
        fill: textColor,
        angle: isHorizontal ? 0 : -90,
      })
    }

    // Ruler scale lines display
    for (let j = 0; j + startOffset <= Math.ceil(unitLength); j += gap) {
      const position = Math.round((startOffset + j) * zoom)
      const left = isHorizontal ? position : ruleSize - 6
      const top = isHorizontal ? ruleSize - 6 : position
      const width = isHorizontal ? 0 : 6
      const height = isHorizontal ? 6 : 0
      const stroke = scaleColor

      this.handler.drawingHandler.drawLine({
        left,
        top,
        width,
        height,
        stroke,
      })
    }

    // Draw active object if exists
    this.drawActiveObject({ isHorizontal, rulerLength, startCalibration })
  }

  /**
   * Draw the active object
   * @param options - Ruler drawing options
   */
  private drawActiveObject({ isHorizontal, startCalibration }: RulerDrawOptions) {
    const { ruleSize, backgroundColor, fontSize, highlightColor } = this.handler.rulerOptions
    const activeObjects = this.handler.canvas.getActiveObjects()
    const axis = isHorizontal ? "x" : "y"

    if (!activeObjects.length) {
      return
    }

    const allRect = activeObjects.reduce((rects, obj) => {
      const rect = obj.getBoundingRect()

      // Calculate coordinates separately for grouped objects
      if (obj.group) {
        // Calculate rectangle coordinates
        const groupCenterX = obj.group.width / 2 + obj.group.left
        const objectOffsetFromCenterX =
          (obj.group.width / 2 + (obj.left ?? 0)) * (1 - obj.group.scaleX)
        const groupCenterY = obj.group.height / 2 + obj.group.top
        const objectOffsetFromCenterY =
          (obj.group.height / 2 + (obj.top ?? 0)) * (1 - obj.group.scaleY)

        rect.left += (groupCenterX - objectOffsetFromCenterX) * this.getZoom()
        rect.top += (groupCenterY - objectOffsetFromCenterY) * this.getZoom()
        rect.width *= obj.group.scaleX
        rect.height *= obj.group.scaleY
      }

      rects.push(rect)
      return rects
    }, [] as Rect[])

    const objects = {
      x: this.handler.drawingHandler.mergeLines(allRect, true),
      y: this.handler.drawingHandler.mergeLines(allRect, false),
    }

    // const object = activeObject.getBoundingRect()
    const zoom = this.getZoom()
    for (const object of objects[axis]) {
      // Obtain the value of the number
      const roundFactor = (x: number) => `${Math.round(x / zoom + startCalibration)}`

      const [leftTextVal, rightTextVal] = isHorizontal
        ? [roundFactor(object.left), roundFactor(object.left + object.width)]
        : [roundFactor(object.top), roundFactor(object.top + object.height)]

      const isSameText = leftTextVal === rightTextVal

      // Background mask
      const maskOpt = {
        isHorizontal,
        width: isHorizontal ? 160 : ruleSize - 8,
        height: isHorizontal ? ruleSize - 8 : 160,
        backgroundColor: backgroundColor,
      }

      this.handler.drawingHandler.drawMask({
        ...maskOpt,
        left: isHorizontal ? object.left - 80 : 0,
        top: isHorizontal ? 0 : object.top - 80,
      })

      if (!isSameText) {
        this.handler.drawingHandler.drawMask({
          ...maskOpt,
          left: isHorizontal ? object.width + object.left - 80 : 0,
          top: isHorizontal ? 0 : object.height + object.top - 80,
        })
      }

      // Highlight mask
      this.handler.drawingHandler.drawRect({
        left: isHorizontal ? object.left : ruleSize - 6,
        top: isHorizontal ? ruleSize - 6 : object.top,
        width: isHorizontal ? object.width : 6,
        height: isHorizontal ? 6 : object.height,
        fill: `${highlightColor}aa`,
      })

      // Numbers on both sides
      const pad = ruleSize / 2 - fontSize / 2 - 2

      const textOpt = {
        fill: highlightColor,
        angle: isHorizontal ? 0 : -90,
      }

      this.handler.drawingHandler.drawText({
        ...textOpt,
        text: leftTextVal,
        left: isHorizontal ? object.left - 2 : pad,
        top: isHorizontal ? pad : object.top - 2,
        align: isSameText ? "center" : isHorizontal ? "right" : "left",
      })

      if (!isSameText) {
        this.handler.drawingHandler.drawText({
          ...textOpt,
          text: rightTextVal,
          left: isHorizontal ? object.left + object.width + 2 : pad,
          top: isHorizontal ? pad : object.top + object.height + 2,
          align: isHorizontal ? "left" : "right",
        })
      }

      // Lines on both sides
      const lineSize = isSameText ? 6 : 12

      const lineOpt = {
        width: isHorizontal ? 0 : lineSize,
        height: isHorizontal ? lineSize : 0,
        stroke: highlightColor,
      }

      this.handler.drawingHandler.drawLine({
        ...lineOpt,
        left: isHorizontal ? object.left : ruleSize - lineSize,
        top: isHorizontal ? ruleSize - lineSize : object.top,
      })

      if (!isSameText) {
        this.handler.drawingHandler.drawLine({
          ...lineOpt,
          left: isHorizontal ? object.left + object.width : ruleSize - lineSize,
          top: isHorizontal ? ruleSize - lineSize : object.top + object.height,
        })
      }
    }
  }

  /**
   * Calculate the spacing between rulers
   * @param zoom Scaling ratio
   * @returns Return the calculated spacing between rulers
   */
  private getGap(zoom: number) {
    const zoomGapPairs = [
      [18, 2],
      [10, 5],
      [5, 10],
      [2, 25],
      [1, 50],
      [0.5, 100],
      [0.2, 250],
      [0.1, 500],
      [0.05, 1000],
      [0.03, 2500],
      [0.02, 5000],
    ]

    return zoomGapPairs.find(([z]) => zoom >= z)?.[1] || 5000
  }

  /**
   * Get canvas size.
   */
  private getSize() {
    return {
      width: this.handler.canvas.width ?? 0,
      height: this.handler.canvas.height ?? 0,
    }
  }

  /**
   * Get the current zoom ratio
   * @returns Return the current zoom ratio
   */
  private getZoom() {
    return this.handler.canvas.getZoom()
  }
}

export default RulerHandler
