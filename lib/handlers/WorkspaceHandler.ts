import { Rect } from "fabric"
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

    const workspace = new Rect(this.handler.workspaceOptions)

    this.handler.workspace = workspace
    this.handler.canvas.add(workspace)
    this.handler.canvas.renderAll()
    this.handler.zoomHandler.setZoomToFit()
  }

  /**
   * Resize workspace to fit the container
   */
  public async resizeWorkspace() {
    if (!this.handler.isReady()) {
      return
    }

    const width = this.handler.container.offsetWidth
    const height = this.handler.container.offsetHeight

    this.handler.canvas.setDimensions({ width, height })
    this.handler.canvas.setViewportTransform(this.handler.canvas.viewportTransform)

    // Zoom the canvas
    this.handler.zoomHandler.setZoomToFit()

    // Do not display beyond the canvas
    // const clone = await this.handler.workspace.clone()

    // this.handler.canvas.clipPath = clone
    // this.handler.canvas.requestRenderAll()
  }
}

export default WorkspaceHandler
