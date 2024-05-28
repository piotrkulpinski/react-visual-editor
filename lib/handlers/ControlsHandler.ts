import {
  Control,
  FabricObject,
  Point,
  TPointerEvent,
  Textbox,
  Transform,
  TransformActionHandler,
  controlsUtils,
} from "fabric"
import Handler from "./Handler"

type RotateControl = {
  point: "tlr" | "trr" | "brr" | "blr"
  x: number
  y: number
  offsetX: number
  offsetY: number
  angle: number
}

type CornerControl = {
  point: "tl" | "tr" | "br" | "bl"
  x: number
  y: number
}

type SideControl = {
  point: "ml" | "mt" | "mr" | "mb"
  x: number
  y: number
  actionHandler: TransformActionHandler
}

const PiBy180 = Math.PI / 180

const rotateIcon = (angle: number) => {
  return `url("data:image/svg+xml,<svg height='20' width='20' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'><g fill='none' transform='rotate(${angle} 16 16)'><path fill='white' d='M18.24 5.37C11.41 6.04 5.98 11.46 5.32 18.26L0 18.26L7.8 26L15.61 18.27L10.6 18.27C11.21 14.35 14.31 11.25 18.24 10.64L18.24 15.55L26 7.78L18.24 0L18.24 5.37Z'></path><path fill='black' d='M19.5463 6.61441C12.4063 6.68441 6.61632 12.4444 6.56632 19.5644L3.17632 19.5644L7.80632 24.1444L12.4363 19.5644L9.18632 19.5644C9.24632 13.8844 13.8563 9.28441 19.5463 9.22441L19.5463 12.3844L24.1463 7.78441L19.5463 3.16441L19.5463 6.61441Z'></path></g></svg>") 12 12,auto`
}

class ControlsHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler

    // Global control properties
    FabricObject.ownDefaults.strokeWidth = 0
    FabricObject.ownDefaults.objectCaching = false
    FabricObject.ownDefaults.borderColor = "#5AF"
    FabricObject.ownDefaults.borderOpacityWhenMoving = 1
    FabricObject.ownDefaults.borderScaleFactor = 1.5
    FabricObject.ownDefaults.cornerSize = 10
    FabricObject.ownDefaults.cornerStyle = "rect"
    FabricObject.ownDefaults.cornerColor = "#FFF"
    FabricObject.ownDefaults.cornerStrokeColor = "#5AF"
    FabricObject.ownDefaults.centeredScaling = false
    FabricObject.ownDefaults.centeredRotation = true
    FabricObject.ownDefaults.transparentCorners = false

    // Customize controls
    FabricObject.ownDefaults.controls = this.defaultControls()
    Textbox.ownDefaults.controls = this.defaultControls("textbox")
  }

  /**
   * Create a set of controls for modifying the object
   */
  private defaultControls(type: "textbox" | "object" = "object") {
    const controls: Record<string, Control> = {
      size: this.createSizeControl(),
    }

    const rotateControls: RotateControl[] = [
      { point: "tlr", x: -0.5, y: -0.5, offsetX: -8, offsetY: -8, angle: 0 },
      { point: "trr", x: 0.5, y: -0.5, offsetX: 8, offsetY: -8, angle: 90 },
      { point: "brr", x: 0.5, y: 0.5, offsetX: 8, offsetY: 8, angle: 180 },
      { point: "blr", x: -0.5, y: 0.5, offsetX: -8, offsetY: 8, angle: 270 },
    ]

    let sideControls: SideControl[] = []

    if (type === "textbox") {
      sideControls = [
        { point: "ml", x: -0.5, y: 0, actionHandler: this.changeWidth },
        { point: "mr", x: 0.5, y: 0, actionHandler: this.changeWidth },
      ]
    } else {
      sideControls = [
        { point: "ml", x: -0.5, y: 0, actionHandler: controlsUtils.scalingXOrSkewingY },
        { point: "mr", x: 0.5, y: 0, actionHandler: controlsUtils.scalingXOrSkewingY },
        { point: "mb", x: 0, y: 0.5, actionHandler: controlsUtils.scalingYOrSkewingX },
        { point: "mt", x: 0, y: -0.5, actionHandler: controlsUtils.scalingYOrSkewingX },
      ]
    }

    // Corner controls
    const cornerControls = [
      { point: "tl", x: -0.5, y: -0.5 },
      { point: "tr", x: 0.5, y: -0.5 },
      { point: "bl", x: -0.5, y: 0.5 },
      { point: "br", x: 0.5, y: 0.5 },
    ]

    // Rotate controls
    for (const { point, ...control } of rotateControls) {
      controls[point] = this.createRotateControl(control)
    }

    // Scaling controls
    for (const { point, ...control } of sideControls) {
      controls[point] = this.createSideControl(control)
    }

    // Corner controls
    for (const { point, ...control } of cornerControls) {
      controls[point] = this.createCornerControl(control)
    }

    return controls
  }

  /**
   * Create a size control
   */
  private createSizeControl() {
    return new Control({
      x: 0,
      y: 0.5,
      offsetY: 14,
      sizeX: 0.0001,
      sizeY: 0.0001,
      touchSizeX: 0.0001,
      touchSizeY: 0.0001,
      cursorStyleHandler: () => "",
      render: (ctx, left, top, _, fabricObject: FabricObject) => {
        // todo: Support objects with group-wise inversion
        ctx.save()
        ctx.translate(left, top)

        const calcRotate = () => {
          const objectAngle = fabricObject.group ? fabricObject.getTotalAngle() : fabricObject.angle
          const angleInRadians = objectAngle * PiBy180
          const x = Math.sin(angleInRadians)
          const y = Math.cos(angleInRadians)
          const angle = Math.abs(x) > Math.abs(y) ? Math.sign(x) * 90 : Math.sign(y) * 90 - 90
          return (objectAngle - angle) * PiBy180
        }

        ctx.rotate(calcRotate())

        const fontSize = 11
        ctx.font = `${fontSize}px Inter Variable`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        const { x, y } = this.getDimensions(fabricObject)
        const text = `${x} × ${y}`
        const width = ctx.measureText(text).width + 8
        const height = fontSize + 6

        ctx.roundRect(-width / 2, -height / 2, width, height, 4)
        ctx.fillStyle = "#007fff"
        ctx.fill()

        // Text
        ctx.fillStyle = "#fff"
        ctx.fillText(text, 0, 1)
        ctx.restore()
      },

      positionHandler: (dim, finalMatrix, fabricObject: FabricObject, currentControl) => {
        const activeObject =
          fabricObject.canvas?.getActiveObject instanceof Function
            ? fabricObject.canvas?.getActiveObject()
            : null

        if (activeObject === fabricObject) {
          const angle = fabricObject.getTotalAngle()
          const angleInRadians = angle * PiBy180

          const x = Math.sin(angleInRadians)
          const y = Math.cos(angleInRadians)

          if (Math.abs(x) >= Math.abs(y)) {
            const sign = Math.sign(x)
            currentControl.x = sign / 2
            currentControl.y = 0
            currentControl.offsetX = sign * 14
            currentControl.offsetY = 0
          } else {
            const sign = Math.sign(y)
            currentControl.x = 0
            currentControl.y = sign / 2
            currentControl.offsetX = 0
            currentControl.offsetY = sign * 14
          }

          // Update the sizes of other corners and put them here together to prevent multiple runs.
          this.setCornersSize(fabricObject)
        }

        return this.positionHandler(dim, finalMatrix, fabricObject, currentControl)
      },
    })
  }

  /**
   * Create a rotate control
   */
  private createRotateControl({ x, y, offsetX, offsetY, angle }: Omit<RotateControl, "point">) {
    return new Control({
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

  /**
   * Create a corner control
   */
  private createCornerControl({ x, y }: Omit<CornerControl, "point">) {
    return new Control({
      x,
      y,
      actionName: "resize",
      actionHandler: controlsUtils.scalingEqually,
      cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
    })
  }

  /**
   * Create a side control
   */
  private createSideControl({ x, y, actionHandler }: Omit<SideControl, "point">) {
    return new Control({
      x,
      y,
      render: () => {},
      actionName: "scaling",
      actionHandler,
      cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    })
  }

  /**
   * Change the width of the object
   */
  private changeWidth = controlsUtils.wrapWithFireEvent(
    "scaling",
    controlsUtils.wrapWithFixedAnchor(controlsUtils.changeWidth)
  )

  /**
   * Rotate and snap, hold the Shift key to snap at a 15-degree angle
   */
  private rotationWithSnapping(
    eventData: TPointerEvent,
    transform: Transform,
    x: number,
    y: number
  ) {
    const { shiftKey } = eventData
    const { target } = transform
    const { rotationWithSnapping } = controlsUtils
    const originalSnapAngle = target.snapAngle

    if (shiftKey) {
      target.snapAngle = 15
      const result = rotationWithSnapping(eventData, transform, x, y)
      target.snapAngle = originalSnapAngle
      return result
    }

    return rotationWithSnapping(eventData, transform, x, y)
  }

  /**
   * Get the dimensions of the object
   */
  private getDimensions(fabricObject: FabricObject, noFixed = false) {
    const scale = fabricObject.getObjectScaling()
    const dimensions = fabricObject._getTransformedDimensions(scale)

    if (!noFixed) {
      dimensions.setXY(Math.round(dimensions.x), Math.round(dimensions.y))
    }

    return dimensions
  }

  /**
   * Position handler
   */
  private positionHandler: Control["positionHandler"] = (dim, finalMatrix, _, control) => {
    const { x, y, offsetX, offsetY } = control
    return new Point(x * dim.x + offsetX, y * dim.y + offsetY).transform(finalMatrix)
  }

  /**
   * Set the size of the corners
   */
  private setCornersSize(object: FabricObject) {
    if (!object.canvas) return
    const zoom = object.canvas.getZoom()
    const { x: width, y: height } = this.getDimensions(object).scalarMultiply(zoom)
    const { controls, cornerSize, touchCornerSize } = object
    const cornersH = ["ml", "mr"]
    const cornersV = ["mt", "mb"]

    for (const corner of cornersH) {
      if (controls[corner]) {
        controls[corner].sizeX = cornerSize
        controls[corner].sizeY = height
        controls[corner].touchSizeX = touchCornerSize
        controls[corner].touchSizeY = height
      }
    }

    for (const corner of cornersV) {
      if (controls[corner]) {
        controls[corner].sizeX = width
        controls[corner].sizeY = cornerSize
        controls[corner].touchSizeX = width
        controls[corner].touchSizeY = touchCornerSize
      }
    }
  }
}

export default ControlsHandler
