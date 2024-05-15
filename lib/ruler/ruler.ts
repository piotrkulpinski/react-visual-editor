import { fabric } from "fabric"
import type { IEvent } from "fabric/fabric-impl"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { throttle } from "radash"
import { setupGuideLine } from "./guideline"
import { drawLine, drawMask, drawRect, drawText, getGap, mergeLines } from "./utils"

/**
 * Configuration
 */
export interface RulerOptions {
  /**
   * Ruler Width and Height
   * @default 20
   */
  ruleSize?: number

  /**
   * Font size
   * @default 9
   */
  fontSize?: number

  /**
   * Enable the ruler.
   * @default false
   */
  enabled?: boolean

  /**
   * Background color
   */
  backgroundColor?: string

  /**
   * Text color
   */
  textColor?: string

  /**
   * Scale color
   */
  scaleColor?: string

  /**
   * Border color
   */
  borderColor?: string

  /**
   * Highlight color
   */
  highlightColor?: string
}

export type Rect = {
  left: number
  top: number
  width: number
  height: number
}

export type HighlightRect = Rect & {
  skip?: "x" | "y"
}

class CanvasRuler {
  protected ctx: CanvasRenderingContext2D

  /**
   * Canvas
   */
  public canvas: fabric.Canvas

  /**
   * Setup
   */
  public options: Required<RulerOptions>

  /**
   * Starting point of the ruler
   */
  public startCalibration: undefined | fabric.Point

  private activeOn: "down" | "up" = "up"

  /**
   * Selecting rectangle coordinates
   */
  private objectRect:
    | undefined
    | {
        x: HighlightRect[]
        y: HighlightRect[]
      }

  /**
   * Caching event handlers
   */
  private eventHandler = {
    // calcCalibration: this.calcCalibration.bind(this),
    calcObjectRect: throttle({ interval: 15 }, this.calcObjectRect.bind(this)),
    clearStatus: this.clearStatus.bind(this),
    canvasMouseDown: this.canvasMouseDown.bind(this),
    canvasMouseMove: throttle({ interval: 15 }, this.canvasMouseMove.bind(this)),
    canvasMouseUp: this.canvasMouseUp.bind(this),
    render: (e: any) => {
      // Avoid multiple renders
      if (!e.ctx) return
      this.render()
    },
  }

  private lastAttr: {
    status: "out" | "horizontal" | "vertical"
    cursor: string | undefined
    selection: boolean | undefined
  } = {
    status: "out",
    cursor: undefined,
    selection: undefined,
  }

  private tempGuidelLine: fabric.GuideLine | undefined

  constructor(canvas: fabric.Canvas, options?: RulerOptions) {
    this.canvas = canvas

    // Merge default configurations
    this.options = Object.assign(
      {
        ruleSize: 20,
        fontSize: 9,
        enabled: true,
        backgroundColor: "#fff",
        borderColor: "#E5E5E5",
        highlightColor: "#007fff",
        textColor: "#888888",
        scaleColor: "#D4D4D4",
      },
      options,
    )

    this.ctx = this.canvas.getContext()

    fabric.util.object.extend(this.canvas, {
      ruler: this,
    })

    setupGuideLine()

    if (this.options.enabled) {
      this.enable()
    }
  }

  // Destroy
  public destroy() {
    this.disable()
  }

  /**
   * Remove all guides
   */
  public clearGuideline() {
    this.canvas.remove(...this.canvas.getObjects(fabric.GuideLine.prototype.type))
  }

  /**
   * Show all guides
   */
  public showGuideline() {
    for (const obj of this.canvas.getObjects(fabric.GuideLine.prototype.type)) {
      obj.set("visible", true)
    }

    this.canvas.renderAll()
  }

  /**
   * Hide all guides
   */
  public hideGuideline() {
    for (const obj of this.canvas.getObjects(fabric.GuideLine.prototype.type)) {
      obj.set("visible", false)
    }

    this.canvas.renderAll()
  }

  /**
   * Enable
   */
  public enable() {
    this.options.enabled = true

    // Bind events
    this.canvas.on("after:render", this.eventHandler.calcObjectRect)
    this.canvas.on("after:render", this.eventHandler.render)
    this.canvas.on("mouse:down", this.eventHandler.canvasMouseDown)
    this.canvas.on("mouse:move", this.eventHandler.canvasMouseMove)
    this.canvas.on("mouse:up", this.eventHandler.canvasMouseUp)
    this.canvas.on("selection:cleared", this.eventHandler.clearStatus)

    // Show guides
    this.showGuideline()

    // Draw once
    this.render()
  }

  /**
   * Disable
   */
  public disable() {
    this.options.enabled = false

    // Remove events
    this.canvas.off("after:render", this.eventHandler.calcObjectRect)
    this.canvas.off("after:render", this.eventHandler.render)
    this.canvas.off("mouse:down", this.eventHandler.canvasMouseDown as any)
    this.canvas.off("mouse:move", this.eventHandler.canvasMouseMove as any)
    this.canvas.off("mouse:up", this.eventHandler.canvasMouseUp as any)
    this.canvas.off("selection:cleared", this.eventHandler.clearStatus)

    // Hide guides
    this.hideGuideline()
  }

  /**
   * Toggle
   */
  public toggle() {
    this.options.enabled ? this.disable() : this.enable()
  }

  /**
   * Draw
   */
  public render() {
    const { ruleSize, backgroundColor, enabled } = this.options

    const vpt = this.canvas.viewportTransform
    if (!vpt || !enabled) return

    // Horizontal ruler
    this.draw({
      isHorizontal: true,
      rulerLength: this.getSize().width,
      startCalibration: this.startCalibration?.x ?? -(vpt[4] && vpt[0] ? vpt[4] / vpt[0] : 0),
    })

    // Vertical ruler
    this.draw({
      isHorizontal: false,
      rulerLength: this.getSize().height,
      startCalibration: this.startCalibration?.y ?? -(vpt[5] && vpt[3] ? vpt[5] / vpt[3] : 0),
    })

    // A mask in the top-left corner
    drawMask(this.ctx, {
      isHorizontal: true,
      left: -10,
      top: -10,
      width: ruleSize * 2 + 10,
      height: ruleSize + 10,
      backgroundColor: backgroundColor,
    })

    drawMask(this.ctx, {
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
  private getSize() {
    return {
      width: this.canvas.width ?? 0,
      height: this.canvas.height ?? 0,
    }
  }

  private getZoom() {
    return this.canvas.getZoom()
  }

  private draw(opt: { isHorizontal: boolean; rulerLength: number; startCalibration: number }) {
    const { isHorizontal, rulerLength, startCalibration } = opt
    const zoom = this.getZoom()

    const gap = getGap(zoom)
    const unitLength = rulerLength / zoom
    const startValue = Math[startCalibration > 0 ? "floor" : "ceil"](startCalibration / gap) * gap
    const startOffset = startValue - startCalibration

    // Ruler background
    const canvasSize = this.getSize()
    drawRect(this.ctx, {
      left: 0,
      top: 0,
      width: isHorizontal ? canvasSize.width : this.options.ruleSize,
      height: isHorizontal ? this.options.ruleSize : canvasSize.height,
      fill: this.options.backgroundColor,
      stroke: this.options.borderColor,
    })

    // Display ruler text
    for (let i = 0; i + startOffset <= Math.ceil(unitLength); i += gap) {
      const position = (startOffset + i) * zoom
      const textValue = `${startValue + i}`
      const textLength = (10 * textValue.length) / 4
      const textX = isHorizontal
        ? position - textLength - 1
        : this.options.ruleSize / 2 - this.options.fontSize / 2 - 2
      const textY = isHorizontal
        ? this.options.ruleSize / 2 - this.options.fontSize / 2 - 2
        : position + textLength
      drawText(this.ctx, {
        text: textValue,
        left: textX,
        top: textY,
        fill: this.options.textColor,
        angle: isHorizontal ? 0 : -90,
      })
    }

    // Ruler scale lines display
    for (let j = 0; j + startOffset <= Math.ceil(unitLength); j += gap) {
      const position = Math.round((startOffset + j) * zoom)
      const left = isHorizontal ? position : this.options.ruleSize - 6
      const top = isHorizontal ? this.options.ruleSize - 6 : position
      const width = isHorizontal ? 0 : 6
      const height = isHorizontal ? 6 : 0
      const stroke = this.options.scaleColor

      drawLine(this.ctx, {
        left,
        top,
        width,
        height,
        stroke,
      })
    }

    // Blue ruler mask
    if (this.objectRect) {
      const axis = isHorizontal ? "x" : "y"

      for (const rect of this.objectRect[axis]) {
        // Skip specified rectangle
        if (rect.skip === axis) {
          return
        }

        // Obtain the value of the number
        const roundFactor = (x: number) => `${Math.round(x / zoom + startCalibration)}`
        const leftTextVal = roundFactor(isHorizontal ? rect.left : rect.top)
        const rightTextVal = roundFactor(
          isHorizontal ? rect.left + rect.width : rect.top + rect.height,
        )

        const isSameText = leftTextVal === rightTextVal

        // Background mask
        const maskOpt = {
          isHorizontal,
          width: isHorizontal ? 160 : this.options.ruleSize - 8,
          height: isHorizontal ? this.options.ruleSize - 8 : 160,
          backgroundColor: this.options.backgroundColor,
        }
        drawMask(this.ctx, {
          ...maskOpt,
          left: isHorizontal ? rect.left - 80 : 0,
          top: isHorizontal ? 0 : rect.top - 80,
        })
        if (!isSameText) {
          drawMask(this.ctx, {
            ...maskOpt,
            left: isHorizontal ? rect.width + rect.left - 80 : 0,
            top: isHorizontal ? 0 : rect.height + rect.top - 80,
          })
        }

        // Highlight mask
        drawRect(this.ctx, {
          left: isHorizontal ? rect.left : this.options.ruleSize - 6,
          top: isHorizontal ? this.options.ruleSize - 6 : rect.top,
          width: isHorizontal ? rect.width : 6,
          height: isHorizontal ? 6 : rect.height,
          fill: `${this.options.highlightColor}aa`,
        })

        // Numbers on both sides
        const pad = this.options.ruleSize / 2 - this.options.fontSize / 2 - 2

        const textOpt = {
          fill: this.options.highlightColor,
          angle: isHorizontal ? 0 : -90,
        }

        drawText(this.ctx, {
          ...textOpt,
          text: leftTextVal,
          left: isHorizontal ? rect.left - 2 : pad,
          top: isHorizontal ? pad : rect.top - 2,
          align: isSameText ? "center" : isHorizontal ? "right" : "left",
        })

        if (!isSameText) {
          drawText(this.ctx, {
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
          stroke: this.options.highlightColor,
        }

        drawLine(this.ctx, {
          ...lineOpt,
          left: isHorizontal ? rect.left : this.options.ruleSize - lineSize,
          top: isHorizontal ? this.options.ruleSize - lineSize : rect.top,
        })

        if (!isSameText) {
          drawLine(this.ctx, {
            ...lineOpt,
            left: isHorizontal ? rect.left + rect.width : this.options.ruleSize - lineSize,
            top: isHorizontal ? this.options.ruleSize - lineSize : rect.top + rect.height,
          })
        }
      }
    }
    // draw end
  }

  /**
   * Calculate starting point
   */
  // private calcCalibration() {
  //   if (this.startCalibration) return;
  //   // console.log('calcCalibration');
  //   const workspace = this.canvas.getObjects().find((item: any) => {
  //     return item.id === 'workspace';
  //   });
  //   if (!workspace) return;
  //   const rect = workspace.getBoundingRect(false);
  //   this.startCalibration = new fabric.Point(-rect.left, -rect.top).divide(this.getZoom());
  // }

  private calcObjectRect() {
    const activeObjects = this.canvas.getActiveObjects()
    if (activeObjects.length === 0) return
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
        rect.width *= group.scaleX
        rect.height *= group.scaleY
        const groupCenterX = group.width / 2 + group.left
        const objectOffsetFromCenterX = (group.width / 2 + (obj.left ?? 0)) * (1 - group.scaleX)
        rect.left += (groupCenterX - objectOffsetFromCenterX) * this.getZoom()
        const groupCenterY = group.height / 2 + group.top
        const objectOffsetFromCenterY = (group.height / 2 + (obj.top ?? 0)) * (1 - group.scaleY)
        rect.top += (groupCenterY - objectOffsetFromCenterY) * this.getZoom()
      }
      if (obj instanceof fabric.GuideLine) {
        rect.skip = obj.isHorizontal() ? "x" : "y"
      }
      rects.push(rect)
      return rects
    }, [] as HighlightRect[])
    if (allRect.length === 0) return
    this.objectRect = {
      x: mergeLines(allRect, true),
      y: mergeLines(allRect, false),
    }
  }

  /**
   * Clear starting point and rectangle coordinates
   */
  private clearStatus() {
    // this.startCalibration = undefined;
    this.objectRect = undefined
  }

  /**
    Check if the mouse is on the ruler
   * @param point
   * @returns "vertical" | "horizontal" | false
   */
  public isPointOnRuler(point: fabric.Point) {
    if (
      new fabric.Rect({
        left: 0,
        top: 0,
        width: this.options.ruleSize,
        height: this.canvas.height,
      }).containsPoint(point)
    ) {
      return "vertical"
    }

    if (
      new fabric.Rect({
        left: 0,
        top: 0,
        width: this.canvas.width,
        height: this.options.ruleSize,
      }).containsPoint(point)
    ) {
      return "horizontal"
    }

    return false
  }

  private canvasMouseDown(e: IEvent<MouseEvent>) {
    if (!e.pointer || !e.absolutePointer) return
    const hoveredRuler = this.isPointOnRuler(e.pointer)
    if (hoveredRuler && this.activeOn === "up") {
      // Backup properties
      this.lastAttr.selection = this.canvas.selection
      this.canvas.selection = false
      this.activeOn = "down"

      this.tempGuidelLine = new fabric.GuideLine(
        hoveredRuler === "horizontal" ? e.absolutePointer.y : e.absolutePointer.x,
        {
          axis: hoveredRuler,
          visible: false,
        },
      )

      this.canvas.add(this.tempGuidelLine)
      this.canvas.setActiveObject(this.tempGuidelLine)

      this.canvas._setupCurrentTransform(e.e, this.tempGuidelLine, true)

      this.tempGuidelLine.fire("down", this.getCommonEventInfo(e))
    }
  }

  private getCommonEventInfo = (e: IEvent<MouseEvent>) => {
    if (!this.tempGuidelLine || !e.absolutePointer) return
    return {
      e: e.e,
      transform: this.tempGuidelLine.get("transform"),
      pointer: {
        x: e.absolutePointer.x,
        y: e.absolutePointer.y,
      },
      target: this.tempGuidelLine,
    }
  }

  private canvasMouseMove(e: IEvent<MouseEvent>) {
    if (!e.pointer) return

    if (this.tempGuidelLine && e.absolutePointer) {
      const pos: Partial<fabric.IGuideLineOptions> = {}
      if (this.tempGuidelLine.axis === "horizontal") {
        pos.top = e.absolutePointer.y
      } else {
        pos.left = e.absolutePointer.x
      }
      this.tempGuidelLine.set({ ...pos, visible: true })

      this.canvas.requestRenderAll()

      const event = this.getCommonEventInfo(e)
      this.canvas.fire("object:moving", event)
      this.tempGuidelLine.fire("moving", event)
    }

    const hoveredRuler = this.isPointOnRuler(e.pointer)
    if (!hoveredRuler) {
      // Mouse exit from inside
      if (this.lastAttr.status !== "out") {
        // Change mouse cursor
        this.canvas.defaultCursor = this.lastAttr.cursor
        this.lastAttr.status = "out"
      }
      return
    }
    // const activeObjects = this.canvas.getActiveObjects();
    // if (activeObjects.length === 1 && activeObjects[0] instanceof fabric.GuideLine) {
    //   return;
    // }
    // Mouse enter from outside or on the other side of the ruler
    if (this.lastAttr.status === "out" || hoveredRuler !== this.lastAttr.status) {
      // Change mouse cursor
      this.lastAttr.cursor = this.canvas.defaultCursor
      this.canvas.defaultCursor = hoveredRuler === "horizontal" ? "ns-resize" : "ew-resize"
      this.lastAttr.status = hoveredRuler
    }
  }

  private canvasMouseUp(e: IEvent<MouseEvent>) {
    if (this.activeOn !== "down") return

    // Restore properties
    this.canvas.selection = this.lastAttr.selection
    this.activeOn = "up"

    this.tempGuidelLine?.fire("up", this.getCommonEventInfo(e))

    this.tempGuidelLine = undefined
  }
}

export default CanvasRuler
