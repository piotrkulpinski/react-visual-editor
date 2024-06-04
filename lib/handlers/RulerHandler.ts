import { util } from "fabric"
import type { HighlightRect } from "../utils/types"
import { Handler } from "./Handler"

type RulerDrawOptions = {
  isHorizontal: boolean
  rulerLength: number
  startCalibration: number
}

export class RulerHandler {
  handler: Handler

  // public tempGuideLine?: GuideLine
  // private activeOn: string = "up"

  // private lastAttr: {
  //   hoveredRuler: false | "horizontal" | "vertical"
  //   cursor: string
  //   selection: boolean | undefined
  // }

  /**
   * Caching event handlers
   */
  private eventHandler = {
    // onMouseDown: this.onMouseDown.bind(this),
    // onMouseMove: throttle({ interval: 15 }, this.onMouseMove.bind(this)),
    // onMouseUp: this.onMouseUp.bind(this),
    // onGuideLineMoving: throttle({ interval: 15 }, this.onGuideLineMoving.bind(this)),
    // onGuideLineMouseup: this.onGuideLineMouseup.bind(this),
    onRender: this.onRender.bind(this),
  }

  /**
   * Active objects
   */
  private activeObjects: undefined | { x: HighlightRect[]; y: HighlightRect[] }

  constructor(handler: Handler) {
    this.handler = handler

    // this.lastAttr = {
    //   hoveredRuler: false,
    //   cursor: this.handler.canvas.defaultCursor,
    //   selection: this.handler.canvas.selection,
    // }

    // Bind events
    // TODO: Unbind events on destroy
    this.handler.canvas.on({
      "after:render": this.eventHandler.onRender,
      // "mouse:move": this.eventHandler.onMouseMove,
      // "mouse:down": this.eventHandler.onMouseDown,
      // "mouse:up": this.eventHandler.onMouseUp,
      // "guideline:moving": this.eventHandler.onGuideLineMoving,
      // "guideline:mouseup": this.eventHandler.onGuideLineMouseup,
    })
  }

  /**
   * Render the vertical and horizontal rulers
   */
  private onRender() {
    const { rulerOptions, canvas } = this.handler
    const { ruleSize, backgroundColor } = rulerOptions
    const { scaleX, scaleY, translateX, translateY } = util.qrDecompose(canvas.viewportTransform)

    // Calculate active objects
    this.calculateActiveObjects()

    // Horizontal ruler
    this.draw({
      isHorizontal: true,
      rulerLength: this.getSize().width,
      startCalibration: -(translateX && scaleX ? translateX / scaleX : 0),
    })

    // Vertical ruler
    this.draw({
      isHorizontal: false,
      rulerLength: this.getSize().height,
      startCalibration: -(translateY && scaleY ? translateY / scaleY : 0),
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

  // private onMouseDown(event: CanvasEvents["mouse:down"]) {
  //   const { viewportPoint, scenePoint, e } = event
  //   const hoveredRuler = this.getHoveredRuler(viewportPoint)

  //   if (!hoveredRuler) return

  //   if (this.activeOn === "up") {
  //     this.lastAttr.selection = this.handler.canvas.selection
  //     this.activeOn = "down"

  //     this.tempGuideLine = new GuideLine(scenePoint[hoveredRuler === "horizontal" ? "y" : "x"], {
  //       type: "GuideLine",
  //       axis: hoveredRuler,
  //       visible: false,
  //       hasControls: false,
  //       hasBorders: false,
  //       stroke: "#01E4F5",
  //       strokeWidth: 1,
  //       originX: "center",
  //       originY: "center",
  //       padding: 4,
  //     })

  //     this.handler.canvas.selection = false
  //     this.handler.canvas.add(this.tempGuideLine)
  //     this.handler.canvas.setActiveObject(this.tempGuideLine)
  //     this.handler.canvas.renderAll()
  //     this.handler.canvas._setupCurrentTransform(e, this.tempGuideLine, true)
  //   }

  //   this.tempGuideLine?.fire("down", event)
  // }

  // private onMouseMove(event: CanvasEvents["mouse:move"]) {
  //   const { viewportPoint, scenePoint } = event

  //   if (this.tempGuideLine && viewportPoint) {
  //     const pos: Partial<GuideLine> = {
  //       top: this.tempGuideLine.axis === "horizontal" ? scenePoint.y : undefined,
  //       left: this.tempGuideLine.axis === "vertical" ? scenePoint.x : undefined,
  //     }

  //     this.tempGuideLine.set({ ...pos, visible: true })

  //     this.handler.canvas.renderAll()
  //     this.handler.canvas.fire("object:moving", {
  //       target: this.tempGuideLine,
  //       transform: this.tempGuideLine.get("transform"),
  //       ...event,
  //     })
  //     this.tempGuideLine.fire("moving", event)
  //   }

  //   const hoveredRuler = this.getHoveredRuler(viewportPoint)

  //   this.handler.canvas.defaultCursor = this.lastAttr.cursor
  //   if (!hoveredRuler) return
  //   this.lastAttr.cursor = this.handler.canvas.defaultCursor
  //   this.lastAttr.hoveredRuler = hoveredRuler
  //   this.handler.canvas.defaultCursor = hoveredRuler === "horizontal" ? "ns-resize" : "ew-resize"
  // }

  // private onMouseUp(event: CanvasEvents["mouse:up"]) {
  //   if (this.activeOn !== "down") return

  //   this.activeOn = "up"

  //   // Restore Attributes
  //   this.handler.canvas.selection = this.lastAttr.selection ?? true
  //   this.handler.canvas.renderAll()

  //   // Clear the temporary guide line
  //   if (this.tempGuideLine) {
  //     this.tempGuideLine.selectable = false
  //     this.tempGuideLine?.fire("up", event)
  //     this.tempGuideLine = undefined
  //   }
  // }

  // private onGuideLineMoving({ pointer, target }: any) {
  //   if (this.getHoveredRuler(pointer)) {
  //     target.moveCursor = "not-allowed"
  //   } else {
  //     target.moveCursor = target.isHorizontal() ? "ns-resize" : "ew-resize"
  //   }
  // }

  // private onGuideLineMouseup({ pointer, target }: any) {
  //   if (this.getHoveredRuler(pointer)) {
  //     this.handler.canvas.remove(target)
  //     this.handler.canvas.setCursor(this.handler.canvas.defaultCursor ?? "")
  //   }
  // }

  // /**
  //     Determine whether the mouse is on the ruler
  //    * @param point
  //    * @returns "vertical" | "horizontal" | false
  //    */
  // private getHoveredRuler(point: Point) {
  //   const ruleSize = this.handler.rulerOptions.ruleSize
  //   const canvas = this.handler.canvas
  //   const vertical = new Rect({ left: 0, top: 0, width: ruleSize, height: canvas.height })
  //   const horizontal = new Rect({ left: 0, top: 0, width: canvas.width, height: ruleSize })

  //   if (vertical.containsPoint(point)) {
  //     return "vertical"
  //   }

  //   if (horizontal.containsPoint(point)) {
  //     return "horizontal"
  //   }

  //   return false
  // }

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

    for (const object of this.activeObjects[axis].filter(({ skip }) => skip !== axis)) {
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

  /**
   * Calculate the active object to be displayed on the ruler
   */
  private calculateActiveObjects() {
    const activeObjects = this.handler.canvas.getActiveObjects()
    const mergeLines = this.handler.drawingHandler.mergeLines

    if (!activeObjects.length) {
      this.activeObjects = undefined
      return
    }

    const objects = activeObjects.map((object) => {
      const rect: HighlightRect = object.getBoundingRect()

      // if (object instanceof GuideLine) {
      //   rect.skip = object.isHorizontal() ? "x" : "y"
      // }

      return rect
    })

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
