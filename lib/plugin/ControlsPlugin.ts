import { fabric } from "fabric"
import type { Control } from "fabric/fabric-impl"
import type Editor from "../Editor"

/**
 * Actual scenario: When scaling a certain object, fabricjs uses `toFixed(2)` as the default precision.
 * In order to achieve a more accurate scaling precision, the default value of `NUM_FRACTION_DIGITS` has been changed to 4, meaning `toFixed(4)`.
 */
fabric.Object.NUM_FRACTION_DIGITS = 4

const verticalIcon =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAxMiAyNCI+CiAgPGcgZmlsdGVyPSJ1cmwoI2EpIj4KICAgIDxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjE2IiB4PSI0IiB5PSI0IiBmaWxsPSIjZmZmIiByeD0iMiIvPgogICAgPHJlY3Qgd2lkdGg9IjMuNSIgaGVpZ2h0PSIxNS41IiB4PSI0LjI1IiB5PSI0LjI1IiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIuMyIgc3Ryb2tlLXdpZHRoPSIuNSIgcng9IjEuNzUiLz4KICA8L2c+CiAgPGRlZnM+CiAgICA8ZmlsdGVyIGlkPSJhIiB3aWR0aD0iMTIiIGhlaWdodD0iMjQiIHg9IjAiIHk9IjAiIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPGZlRmxvb2QgZmxvb2Qtb3BhY2l0eT0iMCIgcmVzdWx0PSJCYWNrZ3JvdW5kSW1hZ2VGaXgiLz4KICAgICAgPGZlQ29sb3JNYXRyaXggaW49IlNvdXJjZUFscGhhIiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDEyNyAwIi8+CiAgICAgIDxmZU9mZnNldC8+CiAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIiLz4KICAgICAgPGZlQ29sb3JNYXRyaXggdmFsdWVzPSIwIDAgMCAwIDAuMTM3Njc0IDAgMCAwIDAgMC4xOTA5MzcgMCAwIDAgMCAwLjI3MDgzMyAwIDAgMCAwLjE1IDAiLz4KICAgICAgPGZlQmxlbmQgaW4yPSJCYWNrZ3JvdW5kSW1hZ2VGaXgiIHJlc3VsdD0iZWZmZWN0MV9kcm9wU2hhZG93Ii8+CiAgICAgIDxmZUJsZW5kIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9ImVmZmVjdDFfZHJvcFNoYWRvdyIgcmVzdWx0PSJzaGFwZSIvPgogICAgPC9maWx0ZXI+CiAgPC9kZWZzPgo8L3N2Zz4K"

const horizontalIcon =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAxMiI+CiAgPGcgZmlsdGVyPSJ1cmwoI2EpIj4KICAgIDxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjE2IiB4PSIyMCIgeT0iNCIgZmlsbD0iI2ZmZiIgcng9IjIiIHRyYW5zZm9ybT0icm90YXRlKDkwIDIwIDQpIi8+CiAgICA8cmVjdCB3aWR0aD0iMy41IiBoZWlnaHQ9IjE1LjUiIHg9IjE5Ljc1IiB5PSI0LjI1IiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIuMyIgc3Ryb2tlLXdpZHRoPSIuNSIgcng9IjEuNzUiIHRyYW5zZm9ybT0icm90YXRlKDkwIDE5Ljc1IDQuMjUpIi8+CiAgPC9nPgogIDxkZWZzPgogICAgPGZpbHRlciBpZD0iYSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjEyIiB4PSIwIiB5PSIwIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxmZUZsb29kIGZsb29kLW9wYWNpdHk9IjAiIHJlc3VsdD0iQmFja2dyb3VuZEltYWdlRml4Ii8+CiAgICAgIDxmZUNvbG9yTWF0cml4IGluPSJTb3VyY2VBbHBoYSIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAxMjcgMCIvPgogICAgICA8ZmVPZmZzZXQvPgogICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyIi8+CiAgICAgIDxmZUNvbG9yTWF0cml4IHZhbHVlcz0iMCAwIDAgMCAwLjEzNzY3NCAwIDAgMCAwIDAuMTkwOTM3IDAgMCAwIDAgMC4yNzA4MzMgMCAwIDAgMC4xNSAwIi8+CiAgICAgIDxmZUJsZW5kIGluMj0iQmFja2dyb3VuZEltYWdlRml4IiByZXN1bHQ9ImVmZmVjdDFfZHJvcFNoYWRvdyIvPgogICAgICA8ZmVCbGVuZCBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJlZmZlY3QxX2Ryb3BTaGFkb3ciIHJlc3VsdD0ic2hhcGUiLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KPC9zdmc+Cg=="

const edgeIcon =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAxOSAxOCI+CiAgPGcgZmlsdGVyPSJ1cmwoI2EpIj4KICAgIDxjaXJjbGUgY3g9IjEwIiBjeT0iOSIgcj0iNSIgZmlsbD0iI2ZmZiIvPgogICAgPGNpcmNsZSBjeD0iMTAiIGN5PSI5IiByPSI0Ljc1IiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIuMyIgc3Ryb2tlLXdpZHRoPSIuNSIvPgogIDwvZz4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9ImEiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgeD0iMSIgeT0iMCIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPgogICAgICA8ZmVDb2xvck1hdHJpeCBpbj0iU291cmNlQWxwaGEiIHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMTI3IDAiLz4KICAgICAgPGZlT2Zmc2V0Lz4KICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMiIvPgogICAgICA8ZmVDb2xvck1hdHJpeCB2YWx1ZXM9IjAgMCAwIDAgMC4xMzc2NzQgMCAwIDAgMCAwLjE5MDkzNyAwIDAgMCAwIDAuMjcwODMzIDAgMCAwIDAuMTUgMCIvPgogICAgICA8ZmVCbGVuZCBpbjI9IkJhY2tncm91bmRJbWFnZUZpeCIgcmVzdWx0PSJlZmZlY3QxX2Ryb3BTaGFkb3ciLz4KICAgICAgPGZlQmxlbmQgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0iZWZmZWN0MV9kcm9wU2hhZG93IiByZXN1bHQ9InNoYXBlIi8+CiAgICA8L2ZpbHRlcj4KICA8L2RlZnM+Cjwvc3ZnPgo="

const rotateIcon =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAxOCAxOCI+CiAgPGcgZmlsdGVyPSJ1cmwoI2EpIj4KICAgIDxjaXJjbGUgY3g9IjkiIGN5PSI5IiByPSI1IiBmaWxsPSIjZmZmIi8+CiAgICA8Y2lyY2xlIGN4PSI5IiBjeT0iOSIgcj0iNC43NSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iLjMiIHN0cm9rZS13aWR0aD0iLjUiLz4KICA8L2c+CiAgPHBhdGggc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iLjUiIGQ9Ik0xMC44IDExLjEySDkuNXYtMS4zTTYuOTUgNi43M2gxLjN2MS4zIi8+CiAgPHBhdGggc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iLjUiIGQ9Ik05LjcgNi45MmExLjk2IDEuOTYgMCAwIDEgLjczIDMuMjNsLS45My45TTguMjYgNi43MmwtLjk1IDFhMS45NiAxLjk2IDAgMCAwIC43MyAzLjI0Ii8+CiAgPGRlZnM+CiAgICA8ZmlsdGVyIGlkPSJhIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjAiIHk9IjAiIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPGZlRmxvb2QgZmxvb2Qtb3BhY2l0eT0iMCIgcmVzdWx0PSJCYWNrZ3JvdW5kSW1hZ2VGaXgiLz4KICAgICAgPGZlQ29sb3JNYXRyaXggaW49IlNvdXJjZUFscGhhIiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDEyNyAwIi8+CiAgICAgIDxmZU9mZnNldC8+CiAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIiLz4KICAgICAgPGZlQ29sb3JNYXRyaXggdmFsdWVzPSIwIDAgMCAwIDAuMTM3Njc0IDAgMCAwIDAgMC4xOTA5MzcgMCAwIDAgMCAwLjI3MDgzMyAwIDAgMCAwLjE1IDAiLz4KICAgICAgPGZlQmxlbmQgaW4yPSJCYWNrZ3JvdW5kSW1hZ2VGaXgiIHJlc3VsdD0iZWZmZWN0MV9kcm9wU2hhZG93Ii8+CiAgICAgIDxmZUJsZW5kIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9ImVmZmVjdDFfZHJvcFNoYWRvdyIgcmVzdWx0PSJzaGFwZSIvPgogICAgPC9maWx0ZXI+CiAgPC9kZWZzPgo8L3N2Zz4K"

class ControlsPlugin {
  public canvas: fabric.Canvas
  public editor: Editor
  static pluginName = "ControlsPlugin"

  constructor(canvas: fabric.Canvas, editor: Editor) {
    this.canvas = canvas
    this.editor = editor
    this.init()
  }

  init() {
    this.intervalControl()

    // Selected style
    fabric.Object.prototype.set({
      transparentCorners: false,
      cornerColor: "#FFF",
      cornerSize: 9,
      cornerStyle: "rect",
      cornerStrokeColor: "#0E98FC",
      borderColor: "#51B9F9",
      borderScaleFactor: 2,
      borderOpacityWhenMoving: 1,
      padding: 0,
    })

    // Keep the textbox consistent
    // fabric.Textbox.prototype.controls = fabric.Object.prototype.controls;
  }

  // Middle dash
  intervalControl() {
    type DrawControl = {
      ctx: CanvasRenderingContext2D
      left: number
      top: number
      width: number
      height: number
      angle: number | undefined
    }

    const drawControl = ({ ctx, left, top, width, height, angle }: DrawControl) => {
      if (angle === undefined) return
      ctx.lineWidth = 1
      ctx.save()
      ctx.translate(left, top)
      ctx.rotate(fabric.util.degreesToRadians(angle))
      ctx.rect(-width / 2, -height / 2, width, height)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    }

    const renderVertical: Control["render"] = (ctx, left, top, _, { angle }) => {
      drawControl({ ctx, left, top, width: 6, height: 12, angle })
    }

    const renderHorizontal: Control["render"] = (ctx, left, top, _, { angle }) => {
      drawControl({ ctx, left, top, width: 12, height: 6, angle })
    }

    // Hyphen
    fabric.Object.prototype.controls.ml = new fabric.Control({
      x: -0.5,
      y: 0,
      offsetX: -1,
      render: renderVertical,
      cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingXOrSkewingY,
      getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    })

    fabric.Object.prototype.controls.mr = new fabric.Control({
      x: 0.5,
      y: 0,
      offsetX: 1,
      render: renderVertical,
      cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingXOrSkewingY,
      getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    })

    fabric.Object.prototype.controls.mb = new fabric.Control({
      x: 0,
      y: 0.5,
      offsetY: 1,
      render: renderHorizontal,
      cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingYOrSkewingX,
      getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    })

    fabric.Object.prototype.controls.mt = new fabric.Control({
      x: 0,
      y: -0.5,
      offsetY: -1,
      render: renderHorizontal,
      cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingYOrSkewingX,
      getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    })
  }
}

export default ControlsPlugin
