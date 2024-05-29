import { FabricObject, Line, classRegistry } from "fabric"

export class GuideLine extends Line {
  static type: string = "GuideLine"
  public axis: string = ""

  constructor(point: number | [number, number, number, number], options: Partial<GuideLine>) {
    // Set a new point
    // point += 100
    const size = 99999
    let points = options.axis === "horizontal" ? [-size, 0, size, 0] : [0, -size, 0, size]

    if (typeof point === "object") {
      points = point
    }

    if (typeof point === "number") {
      points =
        options.axis === "horizontal" ? [-size, point, size, point] : [point, -size, point, size]
    }

    const isHorizontal = options.axis === "horizontal"
    options[isHorizontal ? "lockMovementX" : "lockMovementY"] = true
    super(points as [number, number, number, number], options)
    this.axis = options.axis
    this.initEvent()
    this.hoverCursor = isHorizontal ? "ns-resize" : "ew-resize"
  }

  public initEvent() {
    const callback = () => {}

    this.on("mousedown:before", (e) => {
      if (this.activeOn === "down") {
        this.canvas?.setActiveObject(this, e.e)
      }
    })

    this.on("moving", (e) => {
      this.canvas?.fire("guideline:moving", {
        target: this,
        e: e.e,
        pointer: e.pointer,
      })
    })

    this.on("mouseup", (e) => {
      this.moveCursor = this.isHorizontal() ? "ns-resize" : "ew-resize"
      // this.selectable = false
      this.canvas?.fire("guideline:mouseup", {
        target: this,
        e: e.e,
        pointer: e.pointer,
      })
      this.canvas?.fire("object:modified")
    })

    this.on("removed", () => {
      this.off("removed", callback)
      this.off("mousedown:before", callback)
      this.off("moving", callback)
      this.off("mouseup", callback)
      this.canvas?.fire("object:modified")
    })
  }

  isHorizontal() {
    return this.height === 0
  }

  getBoundingRect() {
    this.canvas?.bringObjectToFront(this)
    const isHorizontal = this.isHorizontal()
    const rect = super.getBoundingRect()
    rect[isHorizontal ? "top" : "left"] += rect[isHorizontal ? "height" : "width"] / 2
    rect[isHorizontal ? "height" : "width"] = 0
    return rect
  }

  fire(eventName: any, options?: any) {
    super.fire(eventName, options)
  }

  _render(ctx: CanvasRenderingContext2D) {
    const zoom = this.canvas?.getZoom() || 1

    ctx.save()
    ctx.transform(1 / zoom, 0, 0, 1 / zoom, 0, 0)
    ctx.beginPath()

    if (this.isHorizontal()) {
      ctx.moveTo(-99999, 0)
      ctx.lineTo(99999, 0)
    } else {
      ctx.moveTo(0, -99999)
      ctx.lineTo(0, 99999)
    }

    this._renderStroke(ctx)
    ctx.restore()
  }

  async fromObject(options: any): Promise<Line> {
    const isHorizontal = options.height === 0
    options.xy = isHorizontal ? options.y1 : options.x1
    options.axis = isHorizontal ? "horizontal" : "vertical"
    return await FabricObject._fromObject(options.type, options)
  }
}

classRegistry.setClass(GuideLine, "GuideLine")
