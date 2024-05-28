import { throttle } from "radash"
import type { Rect } from "../utils/types"
import type Handler from "./Handler"

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
    calculateActiveObjects: throttle({ interval: 20 }, this.calculateActiveObjects.bind(this)),
    render: this.render.bind(this),
  }

  /**
   * Active objects
   */
  private activeObjects: undefined | { x: Rect[]; y: Rect[] }

  constructor(handler: Handler) {
    this.handler = handler

    // Bind events
    // TODO: Unbind events on destroy
    this.handler.canvas.on("after:render", this.eventHandler.calculateActiveObjects)
    this.handler.canvas.on("after:render", this.eventHandler.render)

    // this.canvasEvents = {
    //   'after:render': this.render.bind(this),
    //   'mouse:move': this.mouseMove.bind(this),
    //   'mouse:down': this.mouseDown.bind(this),
    //   'mouse:up': this.mouseUp.bind(this),
    //   'referenceline:moving': this.referenceLineMoving.bind(this),
    //   'referenceline:mouseup': this.referenceLineMouseup.bind(this),
    // }
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
    const axis = isHorizontal ? "x" : "y"
    const zoom = this.getZoom()

    if (!this.activeObjects) {
      return
    }

    for (const object of this.activeObjects[axis]) {
      const startValue = isHorizontal ? object.left : object.top
      const dimensionValue = isHorizontal ? object.width : object.height

      const position = [0, (startValue - startCalibration) * zoom]
      const dimension = [ruleSize, dimensionValue * zoom]

      const [left, top] = isHorizontal ? position.reverse() : position
      const [width, height] = isHorizontal ? dimension.reverse() : dimension

      const startLabel = Math.round(startValue)
      const endLabel = Math.round(startValue + dimensionValue)
      const isSameLabel = startLabel === endLabel
      const pad = ruleSize / 2 - fontSize / 2 - 2
      const lineSize = isSameLabel ? 6 : 12

      // Background mask
      const maskOpt = {
        isHorizontal,
        width: isHorizontal ? 160 : ruleSize - 8,
        height: isHorizontal ? ruleSize - 8 : 160,
        backgroundColor: backgroundColor,
      }

      this.handler.drawingHandler.drawMask({
        ...maskOpt,
        left: isHorizontal ? left - 80 : 0,
        top: isHorizontal ? 0 : top - 80,
      })

      if (!isSameLabel) {
        this.handler.drawingHandler.drawMask({
          ...maskOpt,
          left: isHorizontal ? width + left - 80 : 0,
          top: isHorizontal ? 0 : height + top - 80,
        })
      }

      // Highlight mask
      this.handler.drawingHandler.drawRect({
        left: isHorizontal ? left : ruleSize - 6,
        top: isHorizontal ? ruleSize - 6 : top,
        width: isHorizontal ? width : 6,
        height: isHorizontal ? 6 : height,
        fill: `${highlightColor}aa`,
      })

      // Numbers on both sides
      const textOpt = {
        fill: highlightColor,
        angle: isHorizontal ? 0 : -90,
      }

      this.handler.drawingHandler.drawText({
        ...textOpt,
        text: `${startLabel}`,
        left: isHorizontal ? left - 2 : pad,
        top: isHorizontal ? pad : top - 2,
        align: isSameLabel ? "center" : isHorizontal ? "right" : "left",
      })

      if (!isSameLabel) {
        this.handler.drawingHandler.drawText({
          ...textOpt,
          text: `${endLabel}`,
          left: isHorizontal ? left + width + 2 : pad,
          top: isHorizontal ? pad : top + height + 2,
          align: isHorizontal ? "left" : "right",
        })
      }

      // Lines on both sides
      const lineOpt = {
        width: isHorizontal ? 0 : lineSize,
        height: isHorizontal ? lineSize : 0,
        stroke: highlightColor,
      }

      this.handler.drawingHandler.drawLine({
        ...lineOpt,
        left: isHorizontal ? left : ruleSize - lineSize,
        top: isHorizontal ? ruleSize - lineSize : top,
      })

      if (!isSameLabel) {
        this.handler.drawingHandler.drawLine({
          ...lineOpt,
          left: isHorizontal ? left + width : ruleSize - lineSize,
          top: isHorizontal ? ruleSize - lineSize : top + height,
        })
      }
    }
  }

  private calculateActiveObjects() {
    const activeObjects = this.handler.canvas.getActiveObjects()
    const mergeLines = this.handler.drawingHandler.mergeLines

    if (!activeObjects.length) {
      this.activeObjects = undefined
      return
    }

    const objects = activeObjects.map((obj) => obj.getBoundingRect())

    this.activeObjects = {
      x: mergeLines(objects, true),
      y: mergeLines(objects, false),
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
