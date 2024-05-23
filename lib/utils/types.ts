import type { fabric } from "fabric"
import type { ICanvasOptions } from "fabric/fabric-impl"
import type Handler from "../handlers/Handler"

export type HandlerCallback = {
  /**
   * When has been added object in Canvas, Called function
   *
   */
  onAdd?: (object: fabric.Object) => void

  /**
   * Return contextmenu element
   *
   */
  onContext?: (el: HTMLDivElement, e: MouseEvent, target?: fabric.Object) => Promise<any> | any

  /**
   * When zoom, Called function
   */
  onZoom?: (zoomRatio: number) => void

  /**
   * When clicked object, Called function
   *
   */
  onClick?: (canvas: fabric.Canvas, target: fabric.Object) => void

  /**
   * When double clicked object, Called function
   *
   */
  onDblClick?: (canvas: fabric.Canvas, target: fabric.Object) => void

  /**
   * When modified object, Called function
   */
  onModified?: (target: fabric.Object) => void

  /**
   * When select object, Called function
   *
   */
  onSelect?: (target: fabric.Object) => void

  /**
   * When has been removed object in Canvas, Called function
   *
   */
  onRemove?: (target: fabric.Object) => void

  /**
   * When has been undo or redo, Called function
   *
   */
  // onTransaction?: (transaction: TransactionEvent) => void

  /**
   * When has been changed interaction mode, Called function
   *
   */
  onInteraction?: (interactionMode: InteractionMode) => void

  /**
   * When canvas has been loaded
   *
   */
  onLoad?: (handler: Handler, canvas?: fabric.Canvas) => void
}

export type HandlerOptions = HandlerCallback & {
  /**
   * Canvas id
   */
  id: string

  /**
   * Canvas object
   */
  canvas: fabric.Canvas

  /**
   * Canvas options
   */
  canvasOptions?: ICanvasOptions

  /**
   * Canvas parent element
   */
  container: HTMLDivElement

  /**
   * Zoom options
   */
  zoomOptions?: ZoomOptions

  /**
   * Workspace options
   */
  workspaceOptions?: WorkspaceOptions

  // /**
  //  * Canvas option
  //  */
  // canvasOption?: CanvasOption

  // /**
  //  * Default option for Fabric Object
  //  */
  // objectOption?: FabricObjectOption

  // /**
  //  * Guideline option
  //  */
  // guidelineOption?: GuidelineOption

  // /**
  //  * ActiveSelection option
  //  */
  // activeSelectionOption?: Partial<FabricObjectOption<fabric.ActiveSelection>>
}

export type ZoomOptions = {
  /**
   * Whether should be enabled
   * @type {boolean}
   */
  enabled: boolean

  /**
   * Min zoom ratio
   * @type {number}
   */
  minZoom: number

  /**
   * Max zoom ratio
   * @type {number}
   */
  maxZoom: number

  /**
   * Zoom ratio step
   * @type {number[]}
   */
  steps: number[]

  /**
   * The ratio for the fit zoom
   * @type {number}
   */
  fitRatio: number
}

export type WorkspaceOptions = Partial<fabric.Rect>

export type HotkeyHandler = {
  key: string
  handler: () => void
}

export enum InteractionMode {
  SELECT = "select",
  PAN = "pan",
}
