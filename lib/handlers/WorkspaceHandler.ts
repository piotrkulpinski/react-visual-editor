import { Rect } from "fabric"
import type Handler from "./Handler"

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
