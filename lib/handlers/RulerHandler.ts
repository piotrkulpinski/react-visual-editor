import { throttle } from "radash"
import type { HighlightRect, RulerOptions } from "../utils/types"
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
   * Selecting rectangle coordinates
   */
  private selectedObject:
    | undefined
    | {
        x: HighlightRect[]
        y: HighlightRect[]
      }

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
    calcObjectRect: throttle({ interval: 15 }, this.calcObjectRect.bind(this)),
    clearStatus: this.clearStatus.bind(this),
    canvasMouseDown: this.canvasMouseDown.bind(this),
    canvasMouseMove: throttle({ interval: 15 }, this.canvasMouseMove.bind(this)),
    canvasMouseUp: this.canvasMouseUp.bind(this),
    render: () => this.render(),
  }

  constructor(handler: Handler) {
    this.handler = handler

    // Bind events
    // TODO: Unbind events on destroy
    this.handler.canvas.on("after:render", this.eventHandler.calcObjectRect)
    this.handler.canvas.on("after:render", this.eventHandler.render)
    // this.handler.canvas.on("mouse:down", this.eventHandler.canvasMouseDown)
    // this.handler.canvas.on("mouse:move", this.eventHandler.canvasMouseMove)
    // this.handler.canvas.on("mouse:up", this.eventHandler.canvasMouseUp)
    this.handler.canvas.on("selection:cleared", this.eventHandler.clearStatus)

    // Render the ruler
    this.render()
  }

  /**
   * Render the vertical and horizontal rulers
   */
  public render = () => {
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
   * Get canvas size.
   */
  private getSize = () => {
    return {
      width: this.handler.canvas.width ?? 0,
      height: this.handler.canvas.height ?? 0,
    }
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

    // Draw selected object if exists
    this.drawSelectedObject({ isHorizontal, rulerLength, startCalibration })
  }

  /**
   * Draw the selected object
   * @param options - Ruler drawing options
   */
  private drawSelectedObject = ({ isHorizontal, startCalibration }: RulerDrawOptions) => {
    const { ruleSize, backgroundColor, fontSize, highlightColor } = this.handler.rulerOptions
    const axis = isHorizontal ? "x" : "y"
    const zoom = this.getZoom()

    if (!this.selectedObject) {
      return
    }

    for (const rect of this.selectedObject[axis].filter((rect) => !rect.skip)) {
      // Obtain the value of the number
      const roundFactor = (x: number) => `${Math.round(x / zoom + startCalibration)}`
      const leftTextVal = roundFactor(isHorizontal ? rect.left : rect.top)
      const rightTextVal = roundFactor(
        isHorizontal ? rect.left + rect.width : rect.top + rect.height
      )

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
        left: isHorizontal ? rect.left - 80 : 0,
        top: isHorizontal ? 0 : rect.top - 80,
      })

      if (!isSameText) {
        this.handler.drawingHandler.drawMask({
          ...maskOpt,
          left: isHorizontal ? rect.width + rect.left - 80 : 0,
          top: isHorizontal ? 0 : rect.height + rect.top - 80,
        })
      }

      // Highlight mask
      this.handler.drawingHandler.drawRect({
        left: isHorizontal ? rect.left : ruleSize - 6,
        top: isHorizontal ? ruleSize - 6 : rect.top,
        width: isHorizontal ? rect.width : 6,
        height: isHorizontal ? 6 : rect.height,
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
        left: isHorizontal ? rect.left - 2 : pad,
        top: isHorizontal ? pad : rect.top - 2,
        align: isSameText ? "center" : isHorizontal ? "right" : "left",
      })

      if (!isSameText) {
        this.handler.drawingHandler.drawText({
          ...textOpt,
          text: rightTextVal,
          left: isHorizontal ? rect.left + rect.width + 2 : pad,
          top: isHorizontal ? pad : rect.top + rect.height + 2,
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
        left: isHorizontal ? rect.left : ruleSize - lineSize,
        top: isHorizontal ? ruleSize - lineSize : rect.top,
      })

      if (!isSameText) {
        this.handler.drawingHandler.drawLine({
          ...lineOpt,
          left: isHorizontal ? rect.left + rect.width : ruleSize - lineSize,
          top: isHorizontal ? ruleSize - lineSize : rect.top + rect.height,
        })
      }
    }
  }

  /**
   * Calculate the spacing between rulers
   * @param zoom Scaling ratio
   * @returns Return the calculated spacing between rulers
   */
  private getGap = (zoom: number) => {
    const zooms = [0.02, 0.03, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 18]
    const gaps = [5000, 2500, 1000, 500, 250, 100, 50, 25, 10, 5, 2]

    let i = 0
    while (i < zooms.length && (zooms[i] ?? 0) < zoom) {
      i++
    }

    return gaps[i - 1] || 5000
  }

  /**
   * Get the current zoom ratio
   * @returns Return the current zoom ratio
   */
  private getZoom = () => {
    return this.handler.canvas.getZoom()
  }

  /**
   * Calculate the coordinates of the object rectangle
   */
  private calcObjectRect() {
    const activeObjects = this.handler.canvas.getActiveObjects()

    if (activeObjects.length === 0) {
      return
    }

    const allRect = activeObjects.reduce((rects, obj) => {
      const rect: HighlightRect = obj.getBoundingRect(false, true)

      // Calculate coordinates separately for grouped objects
      if (obj.group) {
        const group = {
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          scaleX: 1,
          scaleY: 1,
          ...obj.group,
        }

        // Calculate rectangle coordinates
        const groupCenterX = group.width / 2 + group.left
        const objectOffsetFromCenterX = (group.width / 2 + (obj.left ?? 0)) * (1 - group.scaleX)
        const groupCenterY = group.height / 2 + group.top
        const objectOffsetFromCenterY = (group.height / 2 + (obj.top ?? 0)) * (1 - group.scaleY)

        rect.left += (groupCenterX - objectOffsetFromCenterX) * this.getZoom()
        rect.top += (groupCenterY - objectOffsetFromCenterY) * this.getZoom()
        rect.width *= group.scaleX
        rect.height *= group.scaleY
      }

      if (obj instanceof fabric.GuideLine) {
        rect.skip = obj.isHorizontal() ? "x" : "y"
      }

      rects.push(rect)
      return rects
    }, [] as HighlightRect[])

    if (allRect.length === 0) {
      return
    }

    this.selectedObject = {
      x: this.handler.drawingHandler.mergeLines(allRect, true),
      y: this.handler.drawingHandler.mergeLines(allRect, false),
    }
  }

  /**
   * Clear starting point and rectangle coordinates
   */
  private clearStatus() {
    this.selectedObject = undefined
  }

  /**
   * Check if the mouse is on the ruler
   * @param point
   * @returns "vertical" | "horizontal" | false
   */
  public isPointOnRuler(point: fabric.Point) {
    const verticalRuler = new fabric.Rect({
      left: 0,
      top: 0,
      width: this.handler.rulerOptions.ruleSize,
      height: this.handler.canvas.height,
    })

    const horizontalRuler = new fabric.Rect({
      left: 0,
      top: 0,
      width: this.handler.rulerOptions.ruleSize,
      height: this.handler.canvas.height,
    })

    if (verticalRuler.containsPoint(point)) {
      return "vertical"
    }

    if (horizontalRuler.containsPoint(point)) {
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
      // Backup properties
      this.lastAttr.selection = this.handler.canvas.selection
      this.handler.canvas.selection = false
      this.activeOn = "down"

      this.tempGuidelLine = new fabric.GuideLine(
        hoveredRuler === "horizontal" ? e.absolutePointer.y : e.absolutePointer.x,
        {
          axis: hoveredRuler,
          visible: false,
        }
      )

      this.handler.canvas.add(this.tempGuidelLine)
      this.handler.canvas.setActiveObject(this.tempGuidelLine)
      this.handler.canvas._setupCurrentTransform(e.e, this.tempGuidelLine, true)

      this.tempGuidelLine.fire("down", this.getCommonEventInfo(e))
    }
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

    if (!hoveredRuler) {
      return
    }

    // Mouse exit from inside
    if (this.lastAttr.hoverStatus !== "out") {
      // Change mouse cursor
      this.lastAttr.hoverStatus = "out"

      // Change canvas cursor
      this.handler.canvas.defaultCursor = this.lastAttr.cursor
    }

    // const activeObjects = this.handler.canvas.getActiveObjects();
    // if (activeObjects.length === 1 && activeObjects[0] instanceof fabric.GuideLine) {
    //   return;
    // }

    // Mouse enter from outside or on the other side of the ruler
    if (this.lastAttr.hoverStatus === "out" || hoveredRuler !== this.lastAttr.hoverStatus) {
      // Change mouse cursor
      this.lastAttr.hoverStatus = hoveredRuler
      this.lastAttr.cursor = this.handler.canvas.defaultCursor

      // Change canvas cursor
      this.handler.canvas.defaultCursor = hoveredRuler === "horizontal" ? "ns-resize" : "ew-resize"
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

    this.tempGuidelLine?.fire("up", this.getCommonEventInfo(e))
    this.tempGuidelLine = undefined
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
