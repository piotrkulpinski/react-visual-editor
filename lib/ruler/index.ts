import type { fabric } from "fabric"
import type { Canvas } from "fabric/fabric-impl"
import CanvasRuler, { type RulerOptions } from "./ruler"

function initRuler(canvas: Canvas, options?: RulerOptions) {
  const ruler = new CanvasRuler({
    canvas,
    ...options,
  })

  /**
   * Get the workspace
   */
  const getWorkspace = () => {
    return canvas.getObjects().find(({ id }) => id === "workspace")
  }

  /**
   * Check if the target is outside the object rectangle
   * @param object
   * @param target
   * @returns
   */
  const isRectOut = (object: fabric.Object, target: fabric.GuideLine): boolean => {
    const { top, height, left, width } = object
    const targetRect = target.getBoundingRect(true, true)

    if (!top || !height || !left || !width) {
      return false
    }

    if (target.isHorizontal()) {
      return top > targetRect.top + 1 || top + height < targetRect.top + targetRect.height - 1
    }

    return left > targetRect.left + 1 || left + width < targetRect.left + targetRect.width - 1
  }

  canvas.on("guideline:moving", ({ target }) => {
    const workspace = getWorkspace()

    if (!workspace) {
      return
    }

    if (isRectOut(workspace, target)) {
      target.moveCursor = "not-allowed"
    }
  })

  canvas.on("guideline:mouseup", ({ target }) => {
    const workspace = getWorkspace()

    if (!workspace) {
      return
    }

    if (isRectOut(workspace, target)) {
      canvas.remove(target)
      canvas.setCursor(canvas.defaultCursor ?? "")
    }
  })

  return ruler
}

export default initRuler
