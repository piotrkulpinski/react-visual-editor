/* eslint-disable @typescript-eslint/no-unused-vars */
import { fabric } from "fabric"
import { Transform } from "fabric/fabric-impl"
import Handler from "./Handler"

const rotateIcon = (angle: number) => {
  return `url("data:image/svg+xml,<svg height='20' width='20' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'><g fill='none' transform='rotate(${angle} 16 16)'><path fill='white' d='M18.24 5.37C11.41 6.04 5.98 11.46 5.32 18.26L0 18.26L7.8 26L15.61 18.27L10.6 18.27C11.21 14.35 14.31 11.25 18.24 10.64L18.24 15.55L26 7.78L18.24 0L18.24 5.37Z'></path><path fill='black' d='M19.5463 6.61441C12.4063 6.68441 6.61632 12.4444 6.56632 19.5644L3.17632 19.5644L7.80632 24.1444L12.4363 19.5644L9.18632 19.5644C9.24632 13.8844 13.8563 9.28441 19.5463 9.22441L19.5463 12.3844L24.1463 7.78441L19.5463 3.16441L19.5463 6.61441Z'></path></g></svg>") 12 12,auto`
}

class ControlsHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler

    // Global control properties
    fabric.Object.prototype.set({
      strokeWidth: 0,
      objectCaching: false,
      borderColor: "#5AF",
      borderOpacityWhenMoving: 1,
      borderScaleFactor: 1.5,
      cornerSize: 10,
      cornerStyle: "rect",
      cornerColor: "#FFF",
      cornerStrokeColor: "#5AF",
      centeredScaling: false,
      centeredRotation: true,
      transparentCorners: false,
      rotatingPointOffset: 1,
      lockUniScaling: true,
      hasRotatingPoint: false,
    })

    // Customize controls
    fabric.Object.prototype.controls = this.defaultControls()
    fabric.Textbox.prototype.controls = this.defaultControls()
  }

  /**
   * Rotate and snap, hold the Shift key to snap at a 15-degree angle
   */
  rotationWithSnapping = (eventData: MouseEvent, transform: Transform, x: number, y: number) => {
    const { shiftKey } = eventData
    const { target } = transform
    const { rotationWithSnapping } = fabric.controlsUtils
    const originalSnapAngle = target.snapAngle

    if (shiftKey) {
      target.snapAngle = 15
      const result = rotationWithSnapping(eventData, transform, x, y)
      target.snapAngle = originalSnapAngle
      return result
    }

    return rotationWithSnapping(eventData, transform, x, y)
  }

  defaultControls = () => {
    const controls: fabric.Object["controls"] = []

    const rotateControlPositions = [
      { corner: "tlr", x: -0.5, y: -0.5, offsetX: -8, offsetY: -8, angle: 0 },
      { corner: "trr", x: 0.5, y: -0.5, offsetX: 8, offsetY: -8, angle: 90 },
      { corner: "brr", x: 0.5, y: 0.5, offsetX: 8, offsetY: 8, angle: 180 },
      { corner: "blr", x: -0.5, y: 0.5, offsetX: -8, offsetY: 8, angle: 270 },
    ]

    const scalingControlPositions = [
      { side: "ml", x: -0.5, y: 0, actionHandler: fabric.controlsUtils.scalingXOrSkewingY },
      { side: "mr", x: 0.5, y: 0, actionHandler: fabric.controlsUtils.scalingXOrSkewingY },
      { side: "mb", x: 0, y: 0.5, actionHandler: fabric.controlsUtils.scalingYOrSkewingX },
      { side: "mt", x: 0, y: -0.5, actionHandler: fabric.controlsUtils.scalingYOrSkewingX },
    ]

    // Horn controls
    const hornControlPositions = [
      { corner: "tl", x: -0.5, y: -0.5 },
      { corner: "tr", x: 0.5, y: -0.5 },
      { corner: "bl", x: -0.5, y: 0.5 },
      { corner: "br", x: 0.5, y: 0.5 },
    ]

    // Rotate controls
    for (const { corner, x, y, offsetX, offsetY, angle } of rotateControlPositions) {
      controls[corner] = new fabric.Control({
        x,
        y,
        offsetX,
        offsetY,
        sizeX: 16,
        sizeY: 16,
        render: () => {},
        actionName: "rotate",

        actionHandler: (eventData, transformData, x, y) => {
          const target = transformData.target
          const canvas = target.canvas

          if (canvas) {
            const currentAngle = target.angle ?? 0
            canvas.setCursor(rotateIcon(currentAngle + angle))
          }

          return this.rotationWithSnapping(eventData, transformData, x, y)
        },

        cursorStyleHandler: (_, __, fabricObject) => {
          return rotateIcon((fabricObject.angle ?? 0) + angle)
        },
      })
    }

    // Scaling controls
    for (const { side, x, y, actionHandler } of scalingControlPositions) {
      controls[side] = new fabric.Control({
        x,
        y,
        actionHandler,
        actionName: "scaling",
        cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
        // render: () => {},
        // 不在这里设置positionHandler，放到size的positionHandler一起更新
        // positionHandler: positionHandlerH,
      })
    }

    for (const { corner, x, y } of hornControlPositions) {
      controls[corner] = new fabric.Control({
        x,
        y,
        actionName: "scaling",
        actionHandler: fabric.controlsUtils.scalingEqually,
        cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
      })
    }

    return controls
  }
}

export default ControlsHandler
