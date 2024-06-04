import { CanvasEvents, FabricObject, Point, TPointerEvent } from "fabric"
import { InteractionMode } from "../utils/types"
import { Handler } from "./Handler"

export class InteractionHandler {
  handler: Handler

  /**
   * Store the default selection state
   */
  defaultSelection: boolean

  constructor(handler: Handler) {
    this.handler = handler
    this.defaultSelection = this.handler.canvas.selection

    this.handler.registerHotkeyHandlers(
      { key: "v", handler: () => this.setInteractionMode(InteractionMode.SELECT) },
      { key: "h", handler: () => this.setInteractionMode(InteractionMode.PAN) }
    )

    // Register canvas events
    this.handler.canvas.on("mouse:wheel", this.onMouseWheel.bind(this))
    this.handler.canvas.on("selection:created", this.onSelectionCreated.bind(this))
  }

  /**
   * Pan the canvas when the mouse is moving
   */
  public panCanvas(e: TPointerEvent | WheelEvent) {
    let delta: Point | undefined = undefined

    if (e instanceof MouseEvent) {
      delta = new Point(e.movementX, e.movementY)
    }

    if (e instanceof WheelEvent) {
      delta = new Point(e.deltaX, e.deltaY)
    }

    if (delta) {
      this.handler.canvas.relativePan(delta)
      this.handler.canvas.requestRenderAll()
    }
  }

  /**
   * Mouse wheel event
   */
  private onMouseWheel({ e }: CanvasEvents["mouse:wheel"]) {
    e.preventDefault()
    e.stopPropagation()

    // ctrlKey is set when pinch-zoom is detected
    if (!e.metaKey && !e.ctrlKey) {
      this.panCanvas(e)
    }
  }

  /**
   * Selection created event
   */
  private onSelectionCreated({ selected }: CanvasEvents["selection:created"]) {
    this.updateObjectSelection(selected)
  }

  /**
   * Set interaction mode
   */
  public setInteractionMode(mode: InteractionMode) {
    if (!this.handler.isReady()) {
      return
    }

    if (this.handler.store.getState().interactionMode === mode) {
      return
    }

    this.handler.store.setState({ interactionMode: mode })

    switch (mode) {
      case InteractionMode.SELECT:
        this.handler.canvas.setCursor("default")
        this.handler.canvas.selection = this.defaultSelection
        break
      case InteractionMode.PAN:
        this.defaultSelection = this.handler.canvas.selection
        this.handler.canvas.setCursor("grab")
        this.handler.canvas.selection = false
        break
    }

    this.updateObjectSelection(this.handler.getObjects())
    this.handler.onInteraction?.(mode)
  }

  /**
   * Update object selection
   *
   * @param objects - Fabric objects to update
   */
  private updateObjectSelection(objects: FabricObject[]) {
    const mode = this.handler.store.getState().interactionMode

    for (const object of objects) {
      switch (mode) {
        case InteractionMode.SELECT:
          object.hoverCursor = "move"
          object.selectable = this.defaultSelection
          break
        case InteractionMode.PAN:
          object.selectable = false
          break
      }
    }

    // Deselect all objects when panning
    mode === InteractionMode.PAN && this.handler.canvas.discardActiveObject()

    // Render all objects
    this.handler.canvas.requestRenderAll()
  }
}
