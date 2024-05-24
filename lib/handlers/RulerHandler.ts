/* eslint-disable @typescript-eslint/no-unused-vars */
import { throttle } from "radash"
import type { RulerOptions } from "../utils/types"
import type Handler from "./Handler"
import { IEvent } from "fabric/fabric-impl"

export const defaultRulerOptions: RulerOptions = {
  ruleSize: 20,
  fontSize: 9,
  backgroundColor: "#fff",
  borderColor: "#e5e5e5",
  highlightColor: "#007fff",
  textColor: "#888888",
  scaleColor: "#d4d4d4",
}

type RulerAttributes = {
  hoverStatus: "out" | "horizontal" | "vertical"
  cursor: string | undefined
  selection: boolean | undefined
}

type RulerDrawOptions = {
  isHorizontal: boolean
  rulerLength: number
  startCalibration: number
}

class RulerHandler {
  handler: Handler

  /**
   * Active status of the ruler
   */
  private activeOn: "down" | "up" = "up"

  /**
   * Last attributes of the ruler
   */
  private lastAttr: RulerAttributes = {
    hoverStatus: "out",
    cursor: undefined,
    selection: undefined,
  }

  /**
   * Temporary guideline
   */
  private tempGuidelLine: fabric.GuideLine | undefined

  /**
   * Caching event handlers
   */
  private eventHandler = {
    canvasMouseDown: this.canvasMouseDown.bind(this),
    canvasMouseMove: throttle({ interval: 25 }, this.canvasMouseMove.bind(this)),
    canvasMouseUp: this.canvasMouseUp.bind(this),
    render: this.render.bind(this),
  }

  constructor(handler: Handler) {
    this.handler = handler

    // Bind events
    // TODO: Unbind events on destroy
    this.handler.canvas.on("after:render", this.eventHandler.render)
    // this.handler.canvas.on("mouse:down", this.eventHandler.canvasMouseDown)
    // this.handler.canvas.on("mouse:up", this.eventHandler.canvasMouseUp)
    // this.handler.canvas.on("mouse:move", this.eventHandler.canvasMouseMove)
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
  private draw = ({ isHorizontal, rulerLength, startCalibration }: RulerDrawOptions) => {
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
  private drawActiveObject = ({ isHorizontal, startCalibration }: RulerDrawOptions) => {
    const { ruleSize, backgroundColor, fontSize, highlightColor } = this.handler.rulerOptions
    const activeObject = this.handler.canvas.getActiveObject()

    if (!activeObject) {
      return
    }

    const object = activeObject.getBoundingRect(false, true)
    const zoom = this.getZoom()

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

  /**
   * Calculate the spacing between rulers
   * @param zoom Scaling ratio
   * @returns Return the calculated spacing between rulers
   */
  private getGap = (zoom: number) => {
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
  private getSize = () => {
    return {
      width: this.handler.canvas.width ?? 0,
      height: this.handler.canvas.height ?? 0,
    }
  }

  /**
   * Get the current zoom ratio
   * @returns Return the current zoom ratio
   */
  private getZoom = () => {
    return this.handler.canvas.getZoom()
  }

  /**
   * Check if the mouse is on the ruler
   * @param point
   * @returns "vertical" | "horizontal" | false
   */
  public isPointOnRuler({ x, y }: fabric.Point) {
    const { ruleSize } = this.handler.rulerOptions

    if (x >= 0 && x <= ruleSize) {
      return "vertical"
    }

    if (y >= 0 && y <= ruleSize) {
      return "horizontal"
    }

    return false
  }

  /**
   * Mouse down event on canvas
   * @param e - Mouse down event
   */
  private canvasMouseDown(e: IEvent<MouseEvent>) {
    if (!e.pointer || !e.absolutePointer) {
      return
    }

    const hoveredRuler = this.isPointOnRuler(e.pointer)

    if (hoveredRuler && this.activeOn === "up") {
      const { x, y } = e.absolutePointer

      // Backup properties
      this.lastAttr.selection = this.handler.canvas.selection
      this.handler.canvas.selection = false
      this.activeOn = "down"

      // Create a temporary guide line
      this.tempGuidelLine = new fabric.GuideLine(hoveredRuler === "horizontal" ? y : x, {
        axis: hoveredRuler,
        visible: false,
      })

      // Set up the temporary guide line
      this.handler.canvas.add(this.tempGuidelLine)
      this.handler.canvas.setActiveObject(this.tempGuidelLine)
      this.handler.canvas._setupCurrentTransform(e.e, this.tempGuidelLine, true)

      // Trigger the down event
      this.tempGuidelLine.fire("down", this.getCommonEventInfo(e))
    }
  }

  /**
   * Mouse move event on canvas
   * @param e - Mouse move event
   */
  private canvasMouseUp(e: IEvent<MouseEvent>) {
    if (this.activeOn !== "down") return

    // Restore properties
    this.handler.canvas.selection = this.lastAttr.selection
    this.activeOn = "up"

    // Trigger the up event
    this.tempGuidelLine?.fire("up", this.getCommonEventInfo(e))
    this.tempGuidelLine = undefined
  }

  /**
   * Mouse move event on canvas
   * @param e - Mouse move event
   */
  private canvasMouseMove(e: IEvent<MouseEvent>) {
    if (!e.pointer) return

    if (this.tempGuidelLine && e.absolutePointer) {
      const event = this.getCommonEventInfo(e)
      const pos: Partial<fabric.IGuideLineOptions> = {}

      if (this.tempGuidelLine.axis === "horizontal") {
        pos.top = e.absolutePointer.y
      } else {
        pos.left = e.absolutePointer.x
      }

      // Render canvas and fire event
      this.handler.canvas.requestRenderAll()
      this.handler.canvas.fire("object:moving", event)

      // Set temporary guideline and fire event
      this.tempGuidelLine.set({ ...pos, visible: true })
      this.tempGuidelLine.fire("moving", event)
    }

    const hoveredRuler = this.isPointOnRuler(e.pointer)

    // If the mouse is not on the ruler, return the cursor to the default state
    if (!hoveredRuler) {
      this.lastAttr.hoverStatus = "out"
      this.handler.canvas.defaultCursor = "default"
      return
    }

    // If the mouse is on the ruler, change the cursor
    if (this.lastAttr.hoverStatus !== hoveredRuler) {
      const cursorMap = {
        horizontal: "ns-resize",
        vertical: "ew-resize",
      }

      this.lastAttr.hoverStatus = hoveredRuler
      this.handler.canvas.defaultCursor = cursorMap[hoveredRuler]
    }
  }

  /**
   * Get common event information
   * @param e - Mouse event object
   * @returns Return common event information
   */
  private getCommonEventInfo = ({ e, absolutePointer }: IEvent<MouseEvent>) => {
    if (!this.tempGuidelLine || !absolutePointer) return

    return {
      e,
      transform: this.tempGuidelLine.get("transform"),
      pointer: { x: absolutePointer.x, y: absolutePointer.y },
      target: this.tempGuidelLine,
    }
  }
}

export default RulerHandler
