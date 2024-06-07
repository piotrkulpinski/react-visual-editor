/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ActiveSelection,
  Canvas,
  CanvasEvents,
  FabricObject,
  Group,
  Point,
  StaticCanvas,
  TPointerEvent,
} from "fabric"
import { Handler } from "./Handler"
import { check } from "../utils/check"
import { HorizontalLineCoords, VerticalLineCoords } from "../utils/types"
import { create } from "zustand"
import { getObjectEntries } from "../utils/helpers"

type ACenterCoords = NonNullable<FabricObject["aCoords"]> & {
  c: Point
}

export type GuideState = {
  isGuideEnabled: boolean
  toggleGuide: () => void
}

export const guideStore = create<GuideState>((set) => ({
  isGuideEnabled: true,
  toggleGuide: () => set(({ isGuideEnabled }) => ({ isGuideEnabled: !isGuideEnabled })),
}))

export class GuideHandler {
  handler: Handler

  private context: CanvasRenderingContext2D
  private aligningLineMargin = 7
  private aligningLineWidth = 1
  private aligningLineColor = "#F68066"

  private snapXPoints = new Set<number>()
  private snapYPoints = new Set<number>()
  private verticalLines = new Set<VerticalLineCoords>()
  private horizontalLines = new Set<HorizontalLineCoords>()

  constructor(handler: Handler) {
    this.handler = handler
    this.context = handler.canvas.getTopContext()

    this.handler.canvas.on({
      "before:render": this.onBeforeRender.bind(this),
      "after:render": this.onAfterRender.bind(this),
      "object:moving": this.onObjectMoving.bind(this),
    })
  }

  /**
   * Toggle the state of the guide
   */
  public toggle() {
    guideStore.getState().toggleGuide()
    this.handler.canvas.requestRenderAll()
  }

  /**
   * Before the render
   */
  private onBeforeRender(_opt: CanvasEvents["before:render"]) {
    this.handler.canvas.clearContext(this.context)
  }

  /**
   * After the render
   */
  private onAfterRender() {
    if (!this.verticalLines.size && !this.horizontalLines.size) {
      return
    }

    const mergeLines = this.handler.drawingHandler.mergeLines
    const activeObject = this.handler.canvas.getActiveObject()
    const movingCoords = this.getCoordsWithCenter(activeObject!)

    for (const line of mergeLines(this.verticalLines)) {
      this.drawVerticalLine(line, movingCoords)
    }

    for (const line of mergeLines(this.horizontalLines)) {
      this.drawHorizontalLine(line, movingCoords)
    }

    this.verticalLines.clear()
    this.horizontalLines.clear()
  }

  /**
   * On object moving
   */
  private onObjectMoving({ e, target }: CanvasEvents["object:moving"]) {
    if (!this.isSnapingEnabled(e)) return

    // Calculate the snap guidelines
    this.calculateMovingGuidelines(target)
  }

  /**
   * Check if snaping is enabled
   * @param e - The pointer event
   */
  private isSnapingEnabled(e: TPointerEvent) {
    // Disable snaping if store is disabled
    if (!guideStore.getState().isGuideEnabled) return false

    // Disable snaping if the meta key is pressed
    if (e.metaKey) return false

    // Disable snaping if the object is not active
    if (!this.handler.canvas._currentTransform) return false

    return true
  }

  /**
   * Find the siblings of the object
   * @param object - The object to find the siblings for
   */
  private getObjectSiblings(object: FabricObject) {
    const activeObjects = this.handler.canvas.getActiveObjects()
    const parentObjects = this.getParentObjects(object)
    const siblings: FabricObject[] = []

    const addObjects = (group: Group | Canvas | StaticCanvas | ActiveSelection) => {
      const objects = group.getObjects().filter((obj) => {
        if (activeObjects.includes(obj) || !obj.visible) {
          return false
        }

        if (check.isActiveSelection(obj) || (check.isCollection(obj) && obj === object.group)) {
          addObjects(obj)
          return false
        }

        return true
      })

      siblings.push(...objects)
    }

    for (const parent of parentObjects) {
      if (check.isNativeGroup(parent)) {
        siblings.push(parent)
      }

      addObjects(parent)
    }

    return siblings
  }

  /**
   * Determine horizontal and vertical snap guidelines for the moving object
   * @param object - The active object
   */
  private calculateMovingGuidelines(object: FabricObject) {
    const siblings = this.getObjectSiblings(object)
    const activeCoords = this.getCoordsWithCenter(object, true)
    const snapCoords = this.getCoordsWithCenter(object)

    for (const sibling of siblings) {
      const siblingCoords = this.getCoordsWithCenter(sibling)

      for (const [aKey, { x: activeX, y: activeY }] of getObjectEntries(activeCoords)) {
        for (const [key, { x, y }] of getObjectEntries(siblingCoords)) {
          // Horizontal snap
          if (this.isInRange(activeY, y)) {
            const coords = this.calcLineCoords(x, snapCoords[aKey].x, sibling.width, key === "c")

            this.horizontalLines.add({ y, ...coords })
            this.snapYPoints.add(activeCoords.c.y - activeY + y)
          }

          // Vertical snap
          if (this.isInRange(activeX, x)) {
            const coords = this.calcLineCoords(y, snapCoords[aKey].y, sibling.height, key === "c")

            this.verticalLines.add({ x, ...coords })
            this.snapXPoints.add(activeCoords.c.x - activeX + x)
          }
        }
      }
    }

    this.snapCenterPoint(object, activeCoords.c)
  }

  /**
   * Calculate the line coordinates
   * @param coord - The coordinate of the object
   * @param activeCoord - The coordinate of the active object
   * @param dimension - The dimension of the object
   * @param isCenter - Whether the object is center
   */
  private calcLineCoords(coord: number, activeCoord: number, dimension: number, isCenter: boolean) {
    const start = Math.min(coord - (isCenter ? dimension / 2 : 0), activeCoord)
    const end = Math.max(coord + (isCenter ? dimension / 2 : 0), activeCoord)

    return { start, end }
  }

  /**
   * Snap the center point of the object to the closest point
   * @param object - The object to snap
   * @param objectCenter - The center point of the object
   */
  private snapCenterPoint(object: FabricObject, objectCenter: Point) {
    if (!this.snapXPoints.size && !this.snapYPoints.size) return

    // Find the closest snap points
    const closestX = this.sortPoints(this.snapXPoints, objectCenter.x)
    const closestY = this.sortPoints(this.snapYPoints, objectCenter.y)

    // Auto snap to closest point
    object.setXY(new Point(closestX, closestY), "center", "center")

    this.snapXPoints.clear()
    this.snapYPoints.clear()
  }

  /**
   * Get the closest snap point
   */
  private sortPoints(list: Set<number>, originPoint: number) {
    if (!list.size) {
      return originPoint
    }

    const sortedList = [...list].sort(
      (a, b) => Math.abs(originPoint - a) - Math.abs(originPoint - b)
    )

    return sortedList[0]
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
   * Check if two specified values are within the specified range for line alignment calculation.
   */
  private isInRange(value1: number, value2: number) {
    const zoom = this.handler.canvas.getZoom()
    const difference = Math.abs(Math.round(value1) - Math.round(value2))

    return difference <= this.aligningLineMargin / zoom
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
  private calcCenterPointByACoords({ tl, br }: NonNullable<FabricObject["aCoords"]>) {
    return new Point((tl.x + br.x) / 2, (tl.y + br.y) / 2)
  }

  /**
   * Calculates the coordinates of an object with its center point.
   * @param object - The Fabric object to calculate coordinates for.
   * @param [adjustForCenterOffset=false] - Whether to adjust the coordinates by subtracting the center offset.
   * @returns The calculated coordinates with the center point.
   */
  private getCoordsWithCenter(object: FabricObject, adjustForCenterOffset = false) {
    const { tl, tr, br, bl } = this.getCoords(object)
    const objectCenter = object.getCenterPoint() // real center point
    const snappedCenter = this.calcCenterPointByACoords({ tl, tr, br, bl }) // snapped center point

    if (adjustForCenterOffset) {
      const centerOffset = snappedCenter.subtract(objectCenter)

      return {
        tl: tl.subtract(centerOffset),
        tr: tr.subtract(centerOffset),
        br: br.subtract(centerOffset),
        bl: bl.subtract(centerOffset),
        c: objectCenter,
      }
    }

    return { tl, tr, br, bl, c: snappedCenter }
  }

  /**
   * Draw a line between two points
   */
  private drawLine(x1: number, y1: number, x2: number, y2: number) {
    const point1 = new Point(x1, y1).transform(this.handler.canvas.viewportTransform)
    const point2 = new Point(x2, y2).transform(this.handler.canvas.viewportTransform)

    // use origin canvas api to draw guideline
    this.context.save()
    this.context.lineWidth = this.aligningLineWidth
    this.context.strokeStyle = this.aligningLineColor
    this.context.beginPath()

    this.context.moveTo(point1.x, point1.y)
    this.context.lineTo(point2.x, point2.y)

    this.context.stroke()
    this.context.restore()
  }

  /**
   * Draw a vertical line
   */
  private drawVerticalLine(coords: VerticalLineCoords, movingCoords: ACenterCoords) {
    if (!Object.values(movingCoords).some(({ x }) => Math.abs(x - coords.x) < 0.0001)) return

    this.drawLine(
      coords.x,
      Math.min(coords.start, coords.end),
      coords.x,
      Math.max(coords.start, coords.end)
    )
  }

  /**
   * Draw a horizontal line
   */
  private drawHorizontalLine(coords: HorizontalLineCoords, movingCoords: ACenterCoords) {
    if (!Object.values(movingCoords).some(({ y }) => Math.abs(y - coords.y) < 0.0001)) return

    this.drawLine(
      Math.min(coords.start, coords.end),
      coords.y,
      Math.max(coords.start, coords.end),
      coords.y
    )
  }
}
