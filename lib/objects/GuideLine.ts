import { fabric } from "fabric"

const GuideLine = fabric.util.createClass(fabric.Line, {
  type: "GuideLine",
  selectable: false,
  hasControls: false,
  hasBorders: false,
  stroke: "#4bec13",
  originX: "center",
  originY: "center",
  padding: 4, // Expand the range of auxiliary lines selection for easier selection
  globalCompositeOperation: "difference",
  axis: "horizontal",
  // excludeFromExport: true,

  initialize(points: number, options: fabric.IGuideLineOptions) {
    const isHorizontal = options.axis === "horizontal"

    // Pointer
    this.hoverCursor = isHorizontal ? "ns-resize" : "ew-resize"

    // Set new point
    const newPoints = isHorizontal
      ? [-999999, points, 999999, points]
      : [points, -999999, points, 999999]

    // Lock movement
    options[isHorizontal ? "lockMovementX" : "lockMovementY"] = true
    // Call parent class initialize
    this.callSuper("initialize", newPoints, options)

    // Bind events
    this.on("mousedown:before", ({ e }) => {
      if (this.activeOn === "down") {
        // After setting selectable:false, the object can only be moved when activated
        this.canvas?.setActiveObject(this, e)
      }
    })

    this.on("moving", ({ e }) => {
      if (this.canvas?.ruler.options.enabled && this.isPointOnRuler(e)) {
        this.moveCursor = "not-allowed"
      } else {
        this.moveCursor = this.isHorizontal() ? "ns-resize" : "ew-resize"
      }

      this.canvas?.fire("guideline:moving", { target: this, e })
    })

    this.on("mouseup", ({ e }) => {
      // Move to the ruler, remove the auxiliary line
      if (this.canvas?.ruler.options.enabled && this.isPointOnRuler(e)) {
        // console.log('Remove auxiliary line', this);
        this.canvas.remove(this)
        return
      }

      this.moveCursor = this.isHorizontal() ? "ns-resize" : "ew-resize"
      this.canvas?.fire("guideline:mouseup", { target: this, e })
    })

    this.on("removed", () => {
      this.off("removed")
      this.off("mousedown:before")
      this.off("moving")
      this.off("mouseup")
    })
  },

  getBoundingRect(absolute, calculate) {
    this.bringToFront()

    const isHorizontal = this.isHorizontal()
    const rect = this.callSuper("getBoundingRect", absolute, calculate)
    rect[isHorizontal ? "top" : "left"] += rect[isHorizontal ? "height" : "width"] / 2
    rect[isHorizontal ? "height" : "width"] = 0
    return rect
  },

  isPointOnRuler({ offsetX, offsetY }) {
    const isHorizontal = this.isHorizontal()
    const hoveredRuler = this.canvas?.ruler.isPointOnRuler(new fabric.Point(offsetX, offsetY))

    if (
      (isHorizontal && hoveredRuler === "horizontal") ||
      (!isHorizontal && hoveredRuler === "vertical")
    ) {
      return hoveredRuler
    }

    return false
  },

  isHorizontal() {
    return this.height === 0
  },
} as fabric.GuideLine)

GuideLine.fromObject = (object: any, callback: any) => {
  const clone = fabric.util.object.clone as (object: any, deep: boolean) => any

  function _callback(instance: any) {
    delete instance.xy
    callback?.(instance)
  }

  const options = clone(object, true)
  const isHorizontal = options.height === 0

  options.xy = isHorizontal ? options.y1 : options.x1
  options.axis = isHorizontal ? "horizontal" : "vertical"

  fabric.Object._fromObject(options.type, options, _callback, "xy")
}

fabric.GuideLine = GuideLine
