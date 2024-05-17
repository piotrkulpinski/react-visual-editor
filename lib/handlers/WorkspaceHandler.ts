import { fabric } from "fabric"
import type { WorkspaceOptions } from "../utils/types"
import type Handler from "./Handler"

export const defaultWorkspaceOptions: WorkspaceOptions = {
  id: "workspace",
  width: 600,
  height: 400,
  fill: "#fff",
  lockScalingX: true,
  lockScalingY: true,
  scaleX: 1,
  scaleY: 1,
  hasBorders: false,
  hasControls: false,
  selectable: false,
  lockMovementX: true,
  lockMovementY: true,
  hoverCursor: "default",
}

class WorkspaceHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler

    const workspace = new fabric.Rect(this.handler.workspaceOptions)

    this.handler.workspace = workspace
    this.handler.canvas.add(workspace)
    this.handler.canvas.renderAll()
    this.handler.objects = this.handler.getObjects()

    // Zoom the canvas to fit the workspace
    this.handler.zoomHandler.setZoomToFit()
  }
}

export default WorkspaceHandler
