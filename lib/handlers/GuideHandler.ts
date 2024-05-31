import {
  ActiveSelection,
  Canvas,
  CanvasEvents,
  FabricObject,
  Group,
  Point,
  StaticCanvas,
} from "fabric"
import type Handler from "./Handler"
import { check } from "../utils/check"

type VerticalLineCoords = {
  x: number
  y1: number
  y2: number
}

type HorizontalLineCoords = {
  y: number
  x1: number
  x2: number
}

type ACoordsWithCenter = NonNullable<FabricObject["aCoords"]> & {
  c: Point
}

type SnapParams = {
  // Current activity object
  activeObject: FabricObject
  // Coordinates of the activity object
  activeObjectCoords: ACoordsWithCenter
  // List of horizontal snap points
  snapXPoints: Set<number>
  // List of vertical snap points
  snapYPoints: Set<number>
}

class GuideHandler {
  handler: Handler

  private aligningLineMargin = 7
  private aligningLineWidth = 1
  private aligningLineColor = "#F68066"

  private verticalLines: VerticalLineCoords[] = []
  private horizontalLines: HorizontalLineCoords[] = []

  constructor(handler: Handler) {
    this.handler = handler

    this.handler.canvas.on({
      "before:render": this.onBeforeRender.bind(this),
      "after:render": this.onAfterRender.bind(this),
      "object:moving": this.onObjectMoving.bind(this),
    })
  }

  /**
   * Before the render
   */
  public onBeforeRender(_opt: CanvasEvents["before:render"]) {
    const context = this.handler.canvas.getSelectionContext()

    this.handler.canvas.clearContext(context)
  }

  /**
   * After the render
   */
  public onAfterRender({ ctx }: CanvasEvents["after:render"]) {
    if (!ctx || (!this.verticalLines.length && !this.horizontalLines.length)) {
      return
    }

    const activeObject = this.handler.canvas.getActiveObject()
    const movingCoords = this.getObjectCoordsWithCenter(activeObject!)

    for (const line of this.verticalLines) {
      this.drawVerticalLine(line, movingCoords)
    }

    for (const line of this.horizontalLines) {
      this.drawHorizontalLine(line, movingCoords)
    }

    this.verticalLines.length = 0
    this.horizontalLines.length = 0
  }

  /**
   * On object moving
   */
  public onObjectMoving({ e, target }: CanvasEvents["object:moving"]) {
    // Disable the guidelines if the shift key is pressed or the object is not active
    if (e.shiftKey || !this.handler.canvas._currentTransform) return

    const activeObjects = this.handler.canvas.getActiveObjects()
    const parentObjects = this.getParentObjects(target)
    const canvasObjects: FabricObject[] = []

    const addObjects = (group: Group | Canvas | StaticCanvas | ActiveSelection) => {
      const objects = group.getObjects().filter((obj) => {
        if (activeObjects.includes(obj) || !obj.visible) {
          return false
        }

        if (check.isActiveSelection(obj) || (check.isCollection(obj) && obj === target.group)) {
          addObjects(obj)
          return false
        }

        return true
      })

      canvasObjects.push(...objects)
    }

    for (const parent of parentObjects) {
      if (check.isNativeGroup(parent)) {
        canvasObjects.push(parent)
      }

      addObjects(parent)
    }

    this.traversAllObjects(target, canvasObjects)
  }

  /**
   * Traverse all objects and find the snap point
   */
  private traversAllObjects(activeObject: FabricObject, canvasObjects: FabricObject[]) {
    const activeObjectCoords = this.getObjectCoordsWithCenter(activeObject)
    const snapXPoints = new Set<number>()
    const snapYPoints = new Set<number>()

    for (const object of canvasObjects) {
      const objCoords = this.getObjectCoordsWithCenter(object)
      const { height, width } = this.getObjMaxWidthHeightByCoords(objCoords)

      // Horizontal snap
      for (const activeObjPoint of this.getKeys(activeObjectCoords)) {
        const newCoords = object.angle !== 0 ? this.omitCoords(objCoords, true) : objCoords

        const calcHorizontalLineCoords = (
          objPoint: keyof ACoordsWithCenter,
          activeCoords: ACoordsWithCenter
        ) => {
          if (objPoint === "c") {
            return {
              x1: Math.min(newCoords.c.x - width / 2, activeCoords[activeObjPoint].x),
              x2: Math.max(newCoords.c.x + width / 2, activeCoords[activeObjPoint].x),
            }
          }

          return {
            x1: Math.min(objCoords[objPoint].x, activeCoords[activeObjPoint].x),
            x2: Math.max(objCoords[objPoint].x, activeCoords[activeObjPoint].x),
          }
        }

        for (const objPoint of this.getKeys(newCoords)) {
          if (this.isInRange(activeObjectCoords[activeObjPoint].y, objCoords[objPoint].y)) {
            const y = objCoords[objPoint].y

            const offset = activeObjectCoords[activeObjPoint].y - y
            snapYPoints.add(activeObjectCoords.c.y - offset)

            const aCoords = this.getCoords(activeObject)
            const { x1, x2 } = calcHorizontalLineCoords(objPoint, {
              ...aCoords,
              c: this.calcCenterPointByACoords(aCoords),
            } as ACoordsWithCenter)

            this.horizontalLines.push({ y, x1, x2 })
          }
        }
      }

      // Vertical snap
      for (const activeObjPoint of this.getKeys(activeObjectCoords)) {
        const newCoords = object.angle !== 0 ? this.omitCoords(objCoords, false) : objCoords

        const calcVerticalLineCoords = (
          objPoint: keyof ACoordsWithCenter,
          activeCoords: ACoordsWithCenter
        ) => {
          if (objPoint === "c") {
            return {
              y1: Math.min(newCoords.c.y - height / 2, activeCoords[activeObjPoint].y),
              y2: Math.max(newCoords.c.y + height / 2, activeCoords[activeObjPoint].y),
            }
          }

          return {
            y1: Math.min(objCoords[objPoint].y, activeCoords[activeObjPoint].y),
            y2: Math.max(objCoords[objPoint].y, activeCoords[activeObjPoint].y),
          }
        }

        for (const objPoint of this.getKeys(newCoords)) {
          if (this.isInRange(activeObjectCoords[activeObjPoint].x, objCoords[objPoint].x)) {
            const x = objCoords[objPoint].x

            const offset = activeObjectCoords[activeObjPoint].x - x
            snapXPoints.add(activeObjectCoords.c.x - offset)

            const aCoords = this.getCoords(activeObject)
            const { y1, y2 } = calcVerticalLineCoords(objPoint, {
              ...aCoords,
              c: this.calcCenterPointByACoords(aCoords),
            } as ACoordsWithCenter)
            this.verticalLines.push({ x, y1, y2 })
          }
        }
      }
    }

    this.snap({ activeObject, activeObjectCoords, snapXPoints, snapYPoints })
  }

  /**
   * Automatic adsorption object
   */
  private snap({ activeObject, activeObjectCoords, snapXPoints, snapYPoints }: SnapParams) {
    if (snapXPoints.size === 0 && snapYPoints.size === 0) return

    // auto snap nearest object, record all the snap points, and then find the nearest one
    activeObject.setXY(
      new Point(
        this.sortPoints(snapXPoints, activeObjectCoords.c.x),
        this.sortPoints(snapYPoints, activeObjectCoords.c.y)
      ),
      "center",
      "center"
    )
  }

  /**
   * Get the nearest snap point
   */
  private sortPoints(list: Set<number>, originPoint: number) {
    if (list.size === 0) {
      return originPoint
    }

    const sortedList = [...list].sort(
      (a, b) => Math.abs(originPoint - a) - Math.abs(originPoint - b)
    )

    return sortedList[0]
  }

  /**
   * Get the key names of the object
   */
  private getKeys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[]
  }

  /**
   * Get the parent object of the target object
   */
  private getParentObjects(target: FabricObject) {
    if (check.isActiveSelection(target)) {
      return Array.from(
        new Set(target.getObjects().map(({ parent }) => parent || this.handler.canvas))
      )
    }

    return target.parent ? [target.parent] : [this.handler.canvas]
  }

  /**
   * Get the maximum width and height of the object based on the coordinates provided
   */
  private getObjMaxWidthHeightByCoords({ c, tl, tr }: ACoordsWithCenter) {
    const width = Math.max(Math.abs(c.x - tl.x), Math.abs(c.x - tr.x)) * 2
    const height = Math.max(Math.abs(c.y - tl.y), Math.abs(c.y - tr.y)) * 2

    return { width, height }
  }

  /**
   * When the object is rotated, certain coordinates need to be ignored.
   * For example, for the horizontal guide lines, only the coordinates
   * of the top and bottom edges are taken (referencing Figma).
   */
  private omitCoords(objCoords: ACoordsWithCenter, isHorizontal = false) {
    const newCoords = objCoords
    const axis = isHorizontal ? "x" : "y"

    for (const key of this.getKeys(objCoords)) {
      if (objCoords[key][axis] < newCoords.tl[axis]) {
        newCoords[key] = objCoords[key]
      }
      if (objCoords[key][axis] > newCoords.tl[axis]) {
        newCoords[key] = objCoords[key]
      }
    }

    return newCoords
  }

  /**
   * Check if value1 and value2 are within the specified range for line alignment calculation.
   */
  private isInRange(value1: number, value2: number) {
    return (
      Math.abs(Math.round(value1) - Math.round(value2)) <=
      this.aligningLineMargin / this.handler.canvas.getZoom()
    )
  }

  /**
   * Get the coordinates of the object
   */
  private getCoords(object: FabricObject) {
    const [tl, tr, br, bl] = object.getCoords()
    return { tl, tr, br, bl }
  }

  /**
   * fabric.Object.getCenterPoint will return the center point of the object calc by mouse moving & dragging distance.
   * calcCenterPointByACoords will return real center point of the object position.
   */
  private calcCenterPointByACoords(coords: NonNullable<FabricObject["aCoords"]>): Point {
    return new Point((coords.tl.x + coords.br.x) / 2, (coords.tl.y + coords.br.y) / 2)
  }

  /**
   * Get object coordinates with center point
   */
  private getObjectCoordsWithCenter(object: FabricObject): ACoordsWithCenter {
    const coords = this.getCoords(object)
    const objectCenter = object.getCenterPoint()
    const centerPoint = this.calcCenterPointByACoords(coords).subtract(objectCenter)
    const newCoords = this.getKeys(coords).map((key) => coords[key].subtract(centerPoint))

    return {
      tl: newCoords[0],
      tr: newCoords[1],
      br: newCoords[2],
      bl: newCoords[3],
      c: objectCenter,
    }
  }

  /**
   * Draw a line between two points
   */
  private drawLine(x1: number, y1: number, x2: number, y2: number) {
    const ctx = this.handler.canvas.getTopContext()
    const point1 = new Point(x1, y1).transform(this.handler.canvas.viewportTransform)
    const point2 = new Point(x2, y2).transform(this.handler.canvas.viewportTransform)

    // use origin canvas api to draw guideline
    ctx.save()
    ctx.lineWidth = this.aligningLineWidth
    ctx.strokeStyle = this.aligningLineColor
    ctx.beginPath()

    ctx.moveTo(point1.x, point1.y)
    ctx.lineTo(point2.x, point2.y)

    ctx.stroke()
    ctx.restore()
  }

  /**
   * Draw a vertical line
   */
  private drawVerticalLine(coords: VerticalLineCoords, movingCoords: ACoordsWithCenter) {
    if (!Object.values(movingCoords).some(({ x }) => Math.abs(x - coords.x) < 0.0001)) return

    this.drawLine(
      coords.x,
      Math.min(coords.y1, coords.y2),
      coords.x,
      Math.max(coords.y1, coords.y2)
    )
  }

  /**
   * Draw a horizontal line
   */
  private drawHorizontalLine(coords: HorizontalLineCoords, movingCoords: ACoordsWithCenter) {
    if (!Object.values(movingCoords).some(({ y }) => Math.abs(y - coords.y) < 0.0001)) return

    this.drawLine(
      Math.min(coords.x1, coords.x2),
      coords.y,
      Math.max(coords.x1, coords.x2),
      coords.y
    )
  }
}

export default GuideHandler
