import { FabricObjectProps, Rect } from "fabric"
import { Handler } from "./Handler"

export class WorkspaceHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler

    const workspace = new Rect(this.handler.workspaceOptions)

    this.handler.workspace = workspace
    this.handler.workspace.on("added", this.createClipPath.bind(this))
    this.handler.workspace.on("modified", this.updateClipPath.bind(this))

    this.handler.canvas.add(workspace)
    this.handler.canvas.requestRenderAll()
    this.handler.zoomHandler.setZoomToFit(true)
  }

  /**
   * Set workspace options
   * @param options
   */
  public setOptions(options: Partial<FabricObjectProps>) {
    this.handler.workspace.set(options)
    this.handler.workspace.fire("modified")

    this.handler.canvas.requestRenderAll()
    this.handler.zoomHandler.setZoomToFit(true)
  }

  /**
   * Clip workspace to the canvas
   */
  private async createClipPath() {
    this.handler.canvas.clipPath = await this.handler.workspace.clone()
    this.handler.canvas.requestRenderAll()
  }

  /**
   * Update the existing clipPath when workspace changes
   */
  private updateClipPath() {
    if (this.handler.canvas.clipPath) {
      this.handler.canvas.clipPath.set(this.handler.workspace)
      this.handler.canvas.clipPath.setCoords()
    }
  }
}
