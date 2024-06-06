/* eslint-disable @typescript-eslint/no-unused-vars */
import hotkeys from "hotkeys-js"
import { debounce } from "radash"
import { type StoreApi, createStore } from "zustand"
import {
  type HandlerOptions,
  type HotkeyHandler,
  InteractionMode,
  type WorkspaceOptions,
  type ZoomOptions,
  RulerOptions,
} from "../utils/types"
import { EventHandler } from "./EventHandler"
import { InteractionHandler } from "./InteractionHandler"
import { WorkspaceHandler } from "./WorkspaceHandler"
import { ZoomHandler } from "./ZoomHandler"
import { HistoryHandler } from "./HistoryHandler"
import { RulerHandler } from "./RulerHandler"
import { CommandHandler } from "./CommandHandler"
import { LayerHandler } from "./LayerHandler"
import { GuideHandler } from "./GuideHandler"
// import { CloneHandler } from "./CloneHandler"
import { DrawingHandler } from "./DrawingHandler"
import { ObjectHandler } from "./ObjectHandler"
import { ControlsHandler } from "./ControlsHandler"
import { HoverHandler } from "./HoverHandler"
import { ExportHandler } from "./ExportHandler"
import { AxisLockHandler } from "./AxisLockHandler"
import { Canvas, FabricObject } from "fabric"
import { Rect } from "fabric"
import { check } from "../utils/check"

export type HandlerStore = {
  // Zoom Handler
  zoom: number
  // Interaction Handler
  interactionMode: InteractionMode
}

/**
 * Main handler for Canvas
 */
export class Handler implements HandlerOptions {
  public id: string
  public canvas: Canvas
  public container: HTMLDivElement
  public store: StoreApi<HandlerStore>
  public workspace!: Rect
  public resizeObserver: ResizeObserver

  public zoomOptions: ZoomOptions
  public workspaceOptions: WorkspaceOptions
  public rulerOptions: RulerOptions
  // public editable: boolean
  // public propertiesToInclude?: string[] = defaults.propertiesToInclude
  // public canvasOption?: CanvasOption = defaults.canvasOption
  // public objectOption: FabricObjectOption = defaults.objectOption
  // public guidelineOption: GuidelineOption = defaults.guidelineOption
  // public keyEvent?: KeyEvent = defaults.keyEvent
  // public activeSelectionOption?: Partial<FabricObjectOption<fabric.ActiveSelection>> =
  //   defaults.activeSelectionOption

  public onAdd?: (object: FabricObject) => void
  public onContext?: (el: HTMLDivElement, e: MouseEvent, target?: FabricObject) => Promise<unknown>
  public onZoom?: (zoomRatio: number) => void
  public onClick?: (canvas: Canvas, target: FabricObject) => void
  public onDblClick?: (canvas: Canvas, target: FabricObject) => void
  public onModified?: (target: FabricObject) => void
  public onSelect?: (target: FabricObject) => void
  public onRemove?: (target: FabricObject) => void
  // public onTransaction?: (transaction: TransactionEvent) => void
  public onInteraction?: (interactionMode: InteractionMode) => void
  public onLoad?: (handler: Handler, canvas?: Canvas) => void

  public drawingHandler: DrawingHandler
  public zoomHandler: ZoomHandler
  public workspaceHandler: WorkspaceHandler
  public historyHandler: HistoryHandler
  public interactionHandler: InteractionHandler
  public commandHandler: CommandHandler
  public layerHandler: LayerHandler
  public rulerHandler: RulerHandler
  public guideHandler: GuideHandler
  // public cloneHandler: CloneHandler
  public axisLockHandler: AxisLockHandler
  public objectHandler: ObjectHandler
  public controlsHandler: ControlsHandler
  public hoverHandler: HoverHandler
  public exportHandler: ExportHandler
  public eventHandler: EventHandler
  // public imageHandler: ImageHandler
  // public contextmenuHandler: ContextmenuHandler
  // public workareaHandler: WorkareaHandler
  // public transactionHandler: TransactionHandler
  // public alignmentHandler: AlignmentHandler
  // public shortcutHandler: ShortcutHandler

  constructor(options: HandlerOptions) {
    // Options
    this.id = options.id
    this.canvas = options.canvas
    this.container = options.container

    // Store
    this.store = createStore(() => ({
      zoom: this.canvas.getZoom(),
      interactionMode: InteractionMode.SELECT,
    }))

    // Zoom options
    this.zoomOptions = {
      minZoom: 0.05,
      maxZoom: 5,
      steps: [0.125, 0.25, 0.5, 0.75, 1, 1.5, 2, 4],
      fitRatio: 0.8,
      ...options.zoomOptions,
    }

    // Workspace options
    this.workspaceOptions = {
      id: "workspace",
      width: 600,
      height: 400,
      fill: "#fff",
      strokeWidth: 0,
      hasBorders: false,
      hasControls: false,
      selectable: false,
      evented: false,
      lockScalingX: true,
      lockScalingY: true,
      lockMovementX: true,
      lockMovementY: true,
      hoverCursor: "default",
      ...options.workspaceOptions,
    }

    // Ruler options
    this.rulerOptions = {
      ruleSize: 20,
      fontSize: 9,
      backgroundColor: "#fff",
      borderColor: "#e5e5e5",
      highlightColor: "#007fff",
      textColor: "#888888",
      scaleColor: "#d4d4d4",
      ...options.rulerOptions,
    }

    // this.setPropertiesToInclude(options.propertiesToInclude)=
    // this.setObjectOption(options.objectOption)
    // this.setFabricObjects(options.fabricObjects)
    // this.setGuidelineOption(options.guidelineOption)
    // this.setActiveSelectionOption(options.activeSelectionOption)
    // this.setKeyEvent(options.keyEvent)

    // Callbacks
    this.onAdd = options.onAdd
    this.onZoom = options.onZoom
    this.onContext = options.onContext
    this.onClick = options.onClick
    this.onModified = options.onModified
    this.onDblClick = options.onDblClick
    this.onSelect = options.onSelect
    this.onRemove = options.onRemove
    // this.onTransaction = options.onTransaction
    this.onInteraction = options.onInteraction
    this.onLoad = options.onLoad

    // Handlers
    this.drawingHandler = new DrawingHandler(this)
    this.zoomHandler = new ZoomHandler(this)
    this.workspaceHandler = new WorkspaceHandler(this)
    this.historyHandler = new HistoryHandler(this)
    this.interactionHandler = new InteractionHandler(this)
    this.commandHandler = new CommandHandler(this)
    this.layerHandler = new LayerHandler(this)
    this.rulerHandler = new RulerHandler(this)
    this.guideHandler = new GuideHandler(this)
    // this.cloneHandler = new CloneHandler(this)
    this.axisLockHandler = new AxisLockHandler(this)
    this.objectHandler = new ObjectHandler(this)
    this.controlsHandler = new ControlsHandler(this)
    this.hoverHandler = new HoverHandler(this)
    this.exportHandler = new ExportHandler(this)
    // this.imageHandler = new ImageHandler(this)
    // this.contextmenuHandler = new ContextmenuHandler(this)
    // this.transactionHandler = new TransactionHandler(this)
    // this.alignmentHandler = new AlignmentHandler(this)
    // this.shortcutHandler = new ShortcutHandler(this)
    this.eventHandler = new EventHandler(this)

    // Resize Observer
    this.resizeObserver = new ResizeObserver(debounce({ delay: 25 }, this.resizeCanvas.bind(this)))
    this.resizeObserver.observe(this.container)
  }

  /**
   * Resize canvas to fit the container
   */
  public async resizeCanvas() {
    if (!this.isReady()) return

    const width = this.container.offsetWidth
    const height = this.container.offsetHeight

    this.canvas.setDimensions({ width, height })
    this.canvas.setViewportTransform(this.canvas.viewportTransform)

    // Zoom the canvas
    this.zoomHandler.setZoomToFit(true)
  }

  // /**
  //  * Set key pair
  //  * @param {keyof FabricObject} key
  //  * @param {*} value
  //  * @returns
  //  */
  // public set = (key: keyof FabricObject, value: any) => {
  //   const activeObject = this.canvas.getActiveObject() as FabricObject
  //   if (!activeObject) {
  //     return
  //   }
  //   if (activeObject.type === "svg" && (key === "fill" || key === "stroke")) {
  //     ;(activeObject as FabricGroup)._objects.forEach(obj => obj.set(key, value))
  //   }
  //   activeObject.set(key, value)
  //   activeObject.setCoords()
  //   this.canvas.requestRenderAll()
  //   const { onModified } = this
  //   if (onModified) {
  //     onModified(activeObject)
  //   }
  // }

  // /**
  //  * Set option
  //  * @param {Partial<FabricObject>} option
  //  * @returns
  //  */
  // public setObject = (option: Partial<FabricObject>) => {
  //   const activeObject = this.canvas.getActiveObject() as any
  //   if (!activeObject) {
  //     return
  //   }
  //   Object.keys(option).forEach(key => {
  //     if (option[key] !== activeObject[key]) {
  //       activeObject.set(key, option[key])
  //       activeObject.setCoords()
  //     }
  //   })
  //   this.canvas.requestRenderAll()
  //   const { onModified } = this
  //   if (onModified) {
  //     onModified(activeObject)
  //   }
  // }

  // /**
  //  * Set key pair by object
  //  * @param {FabricObject} obj
  //  * @param {string} key
  //  * @param {*} value
  //  * @returns
  //  */
  // public setByObject = (obj: any, key: string, value: any) => {
  //   if (!obj) {
  //     return
  //   }
  //   if (obj.type === "svg") {
  //     if (key === "fill") {
  //       obj.setFill(value)
  //     } else if (key === "stroke") {
  //       obj.setStroke(value)
  //     }
  //   }
  //   obj.set(key, value)
  //   obj.setCoords()
  //   this.canvas.renderAll()
  //   const { onModified } = this
  //   if (onModified) {
  //     onModified(obj)
  //   }
  // }

  // /**
  //  * Set key pair by id
  //  * @param {string} id
  //  * @param {string} key
  //  * @param {*} value
  //  */
  // public setById = (id: string, key: string, value: any) => {
  //   const findObject = this.findById(id)
  //   this.setByObject(findObject, key, value)
  // }

  // /**
  //  * Set partial by object
  //  * @param {FabricObject} obj
  //  * @param {FabricObjectOption} option
  //  * @returns
  //  */
  // public setByPartial = (obj: FabricObject, option: FabricObjectOption) => {
  //   if (!obj) {
  //     return
  //   }
  //   if (obj.type === "svg") {
  //     if (option.fill) {
  //       obj.setFill(option.fill)
  //     } else if (option.stroke) {
  //       obj.setStroke(option.stroke)
  //     }
  //   }
  //   obj.set(option)
  //   obj.setCoords()
  //   this.canvas.renderAll()
  // }

  // /**
  //  * Set shadow
  //  * @param {fabric.Shadow} option
  //  * @returns
  //  */
  // public setShadow = (option: fabric.IShadowOptions) => {
  //   const activeObject = this.canvas.getActiveObject() as FabricObject
  //   if (!activeObject) {
  //     return
  //   }
  //   activeObject.set("shadow", new fabric.Shadow(option))
  //   this.canvas.requestRenderAll()
  //   const { onModified } = this
  //   if (onModified) {
  //     onModified(activeObject)
  //   }
  // }

  // /**
  //  * Set the image
  //  * @param {FabricImage} obj
  //  * @param {(File | string)} [source]
  //  * @returns
  //  */
  // public setImage = (obj: FabricImage, source?: File | string): Promise<FabricImage> => {
  //   return new Promise(resolve => {
  //     if (!source) {
  //       obj.set("file", null)
  //       obj.set("src", null)
  //       resolve(
  //         obj.setSrc("./images/sample/transparentBg.png", () => this.canvas.renderAll(), {
  //           dirty: true,
  //         }) as FabricImage,
  //       )
  //     }
  //     if (source instanceof File) {
  //       const reader = new FileReader()
  //       reader.onload = () => {
  //         obj.set("file", source)
  //         obj.set("src", null)
  //         resolve(
  //           obj.setSrc(reader.result as string, () => this.canvas.renderAll(), {
  //             dirty: true,
  //           }) as FabricImage,
  //         )
  //       }
  //       reader.readAsDataURL(source)
  //     } else {
  //       obj.set("file", null)
  //       obj.set("src", source)
  //       resolve(
  //         obj.setSrc(source, () => this.canvas.renderAll(), {
  //           dirty: true,
  //           crossOrigin: "anonymous",
  //         }) as FabricImage,
  //       )
  //     }
  //   })
  // }

  // /**
  //  * Set image by id
  //  * @param {string} id
  //  * @param {*} source
  //  * @returns
  //  */
  // public setImageById = (id: string, source: any) => {
  //   const findObject = this.findById(id) as FabricImage
  //   return Promise.resolve(this.setImage(findObject, source))
  // }

  // /**
  //  * Set visible
  //  * @param {boolean} [visible]
  //  * @returns
  //  */
  // public setVisible = (visible?: boolean) => {
  //   const activeObject = this.canvas.getActiveObject() as FabricElement
  //   if (!activeObject) {
  //     return
  //   }
  //   activeObject.set({
  //     visible,
  //   })
  //   this.canvas.renderAll()
  // }

  // /**
  //  * Set the position on Object
  //  *
  //  * @param {FabricObject} obj
  //  * @param {boolean} [centered]
  //  */
  // public centerObject = (obj: FabricObject, centered?: boolean) => {
  //   if (centered) {
  //     this.canvas.centerObject(obj)
  //     obj.setCoords()
  //   } else {
  //     this.setByPartial(obj, {
  //       left:
  //         obj.left / this.canvas.getZoom() -
  //         obj.width / 2 -
  //         this.canvas.viewportTransform[4] / this.canvas.getZoom(),
  //       top:
  //         obj.top / this.canvas.getZoom() -
  //         obj.height / 2 -
  //         this.canvas.viewportTransform[5] / this.canvas.getZoom(),
  //     })
  //   }
  // }

  // /**
  //  * Add group object
  //  *
  //  * @param {FabricGroup} obj
  //  * @param {boolean} [centered=true]
  //  * @param {boolean} [loaded=false]
  //  * @returns
  //  */
  // public addGroup = (obj: FabricGroup) => {
  //   const { objects = [], ...other } = obj
  //   const _objects = objects.map(child => this.add(child, false, true, true)) as FabricObject[]
  //   return new fabric.Group(_objects, other) as FabricGroup
  // }

  // /**
  //  * Add iamge object
  //  * @param {FabricImage} obj
  //  * @returns
  //  */
  // public addImage = (obj: FabricImage) => {
  //   const { objectOption } = this
  //   const { filters = [], src, file, ...otherOption } = obj
  //   const image = new Image()
  //   // if (typeof src === 'string') {
  //   // 	image.src = src;
  //   // }
  //   const createdObj = new fabric.Image(image, {
  //     ...objectOption,
  //     ...otherOption,
  //   }) as FabricImage
  //   createdObj.set({
  //     filters: this.imageHandler.createFilters(filters),
  //   })
  //   this.setImage(createdObj, src || file)
  //   return createdObj
  // }

  // /**
  //  * Remove object by id
  //  * @param {string} id
  //  */
  // public removeById = (id: string) => {
  //   const findObject = this.findById(id)
  //   if (findObject) {
  //     this.remove(findObject)
  //   }
  // }

  // /**
  //  * Delete at origin object list
  //  * @param {string} id
  //  */
  // public removeOriginById = (id: string) => {
  //   const object = this.findOriginByIdWithIndex(id)
  //   if (object.index > 0) {
  //     this.objects.splice(object.index, 1)
  //   }
  // }

  // /**
  //  * Find object by object
  //  * @param {FabricObject} obj
  //  */
  // public find = (obj: FabricObject) => this.findById(obj.id)

  // /**
  //  * Find object by id
  //  * @param {string} id
  //  * @returns {(FabricObject | null)}
  //  */
  // public findById = (id: string): FabricObject | null => {
  //   let findObject
  //   const exist = this.objects.some(obj => {
  //     if (obj.id === id) {
  //       findObject = obj
  //       return true
  //     }
  //     return false
  //   })
  //   if (!exist) {
  //     console.warn(true, "Not found object by id.")
  //     return null
  //   }
  //   return findObject
  // }

  // /**
  //  * Find object in origin list
  //  * @param {string} id
  //  * @returns
  //  */
  // public findOriginById = (id: string) => {
  //   let findObject: FabricObject
  //   const exist = this.objects.some(obj => {
  //     if (obj.id === id) {
  //       findObject = obj
  //       return true
  //     }
  //     return false
  //   })
  //   if (!exist) {
  //     console.warn("Not found object by id.")
  //     return null
  //   }
  //   return findObject
  // }

  // /**
  //  * Return origin object list
  //  * @param {string} id
  //  * @returns
  //  */
  // public findOriginByIdWithIndex = (id: string) => {
  //   let findObject
  //   let index = -1
  //   const exist = this.objects.some((obj, i) => {
  //     if (obj.id === id) {
  //       findObject = obj
  //       index = i
  //       return true
  //     }
  //     return false
  //   })
  //   if (!exist) {
  //     console.warn("Not found object by id.")
  //     return {}
  //   }
  //   return {
  //     object: findObject,
  //     index,
  //   }
  // }

  // /**
  //  * Select object
  //  * @param {FabricObject} obj
  //  * @param {boolean} [find]
  //  */
  // public select = (obj: FabricObject, find?: boolean) => {
  //   let findObject = obj
  //   if (find) {
  //     findObject = this.find(obj)
  //   }
  //   if (findObject) {
  //     this.canvas.discardActiveObject()
  //     this.canvas.setActiveObject(findObject)
  //     this.canvas.requestRenderAll()
  //   }
  // }

  // /**
  //  * Select by id
  //  * @param {string} id
  //  */
  // public selectById = (id: string) => {
  //   const findObject = this.findById(id)
  //   if (findObject) {
  //     this.canvas.discardActiveObject()
  //     this.canvas.setActiveObject(findObject)
  //     this.canvas.requestRenderAll()
  //   }
  // }

  // /**
  //  * Select all
  //  * @returns
  //  */
  // public selectAll = () => {
  //   this.canvas.discardActiveObject()
  //   const filteredObjects = this.canvas.getObjects().filter((obj: any) => {
  //     if (obj.id === "workarea") {
  //       return false
  //     }
  //     if (!obj.evented) {
  //       return false
  //     }
  //     if (obj.locked) {
  //       return false
  //     }
  //     return true
  //   })
  //   if (!filteredObjects.length) {
  //     return
  //   }
  //   if (filteredObjects.length === 1) {
  //     this.canvas.setActiveObject(filteredObjects[0])
  //     this.canvas.renderAll()
  //     return
  //   }
  //   const activeSelection = new fabric.ActiveSelection(filteredObjects, {
  //     canvas: this.canvas,
  //     ...this.activeSelectionOption,
  //   })
  //   this.canvas.setActiveObject(activeSelection)
  //   this.canvas.renderAll()
  // }

  // /**
  //  * Save origin width, height
  //  * @param {FabricObject} obj
  //  * @param {number} width
  //  * @param {number} height
  //  */
  // public originScaleToResize = (obj: FabricObject, width: number, height: number) => {
  //   if (obj.id === "workarea") {
  //     this.setByPartial(obj, {
  //       workareaWidth: obj.width,
  //       workareaHeight: obj.height,
  //     })
  //   }
  //   this.setByPartial(obj, {
  //     scaleX: width / obj.width,
  //     scaleY: height / obj.height,
  //   })
  // }

  // /**
  //  * When set the width, height, Adjust the size
  //  * @param {number} width
  //  * @param {number} height
  //  */
  // public scaleToResize = (width: number, height: number) => {
  //   const activeObject = this.canvas.getActiveObject() as FabricObject
  //   const { id } = activeObject
  //   const obj = {
  //     id,
  //     scaleX: width / activeObject.width,
  //     scaleY: height / activeObject.height,
  //   }
  //   this.setObject(obj)
  //   activeObject.setCoords()
  //   this.canvas.requestRenderAll()
  // }

  // /**
  //  * Import json
  //  * @param {*} json
  //  * @param {(canvas: fabric.Canvas) => void} [callback]
  //  */
  // public importJSON = async (json: any, callback?: (canvas: fabric.Canvas) => void) => {
  //   if (typeof json === "string") {
  //     json = JSON.parse(json)
  //   }
  //   let prevLeft = 0
  //   let prevTop = 0
  //   this.canvas.setBackgroundColor(
  //     this.canvasOption.backgroundColor,
  //     this.canvas.renderAll.bind(this.canvas),
  //   )
  //   const workarea = json.find((obj: FabricObjectOption) => obj.id === "workarea")
  //   if (!this.workarea) {
  //     this.workareaHandler.initialize()
  //   }
  //   if (workarea) {
  //     prevLeft = workarea.left
  //     prevTop = workarea.top
  //     this.workarea.set(workarea)
  //     await this.workareaHandler.setImage(workarea.src, true)
  //     this.workarea.setCoords()
  //   } else {
  //     this.canvas.centerObject(this.workarea)
  //     this.workarea.setCoords()
  //     prevLeft = this.workarea.left
  //     prevTop = this.workarea.top
  //   }
  //   json.forEach((obj: FabricObjectOption) => {
  //     if (obj.id === "workarea") {
  //       return
  //     }
  //     const canvasWidth = this.canvas.getWidth()
  //     const canvasHeight = this.canvas.getHeight()
  //     const { width, height, scaleX, scaleY, layout, left, top } = this.workarea
  //     if (layout === "fullscreen") {
  //       const leftRatio = canvasWidth / (width * scaleX)
  //       const topRatio = canvasHeight / (height * scaleY)
  //       obj.left *= leftRatio
  //       obj.top *= topRatio
  //       obj.scaleX *= leftRatio
  //       obj.scaleY *= topRatio
  //     } else {
  //       const diffLeft = left - prevLeft
  //       const diffTop = top - prevTop
  //       obj.left += diffLeft
  //       obj.top += diffTop
  //     }
  //     this.add(obj, false, true)
  //     this.canvas.renderAll()
  //   })
  //   this.objects = this.getObjects()
  //   if (callback) {
  //     callback(this.canvas)
  //   }
  //   return Promise.resolve(this.canvas)
  // }

  // /**
  //  * Export json
  //  */
  // public exportJSON = () => this.canvas.toObject(this.propertiesToInclude).objects as FabricObject[]

  // /**
  //  * Active selection to group
  //  * @returns
  //  */
  // public toGroup = (target?: FabricObject) => {
  //   const activeObject = target || (this.canvas.getActiveObject() as fabric.ActiveSelection)
  //   if (!activeObject) {
  //     return null
  //   }
  //   if (activeObject.type !== "activeSelection") {
  //     return null
  //   }
  //   const group = activeObject.toGroup() as FabricObject<fabric.Group>
  //   group.set({
  //     id: uuid(),
  //     name: "New group",
  //     type: "group",
  //     ...this.objectOption,
  //   })
  //   this.objects = this.getObjects()
  //   if (!this.transactionHandler.active) {
  //     this.transactionHandler.save("group")
  //   }
  //   if (this.onSelect) {
  //     this.onSelect(group)
  //   }
  //   this.canvas.renderAll()
  //   return group
  // }

  // /**
  //  * Group to active selection
  //  * @returns
  //  */
  // public toActiveSelection = (target?: FabricObject) => {
  //   const activeObject = target || (this.canvas.getActiveObject() as fabric.Group)
  //   if (!activeObject) {
  //     return
  //   }
  //   if (activeObject.type !== "group") {
  //     return
  //   }
  //   const activeSelection = activeObject.toActiveSelection()
  //   this.objects = this.getObjects()
  //   if (!this.transactionHandler.active) {
  //     this.transactionHandler.save("ungroup")
  //   }
  //   if (this.onSelect) {
  //     this.onSelect(activeSelection)
  //   }
  //   this.canvas.renderAll()
  //   return activeSelection
  // }

  // /**
  //  * Bring forward
  //  */
  // public bringForward = () => {
  //   const activeObject = this.canvas.getActiveObject() as FabricObject
  //   if (activeObject) {
  //     this.canvas.bringForward(activeObject)
  //     if (!this.transactionHandler.active) {
  //       this.transactionHandler.save("bringForward")
  //     }
  //     const { onModified } = this
  //     if (onModified) {
  //       onModified(activeObject)
  //     }
  //   }
  // }

  // /**
  //  * Bring to front
  //  */
  // public bringToFront = () => {
  //   const activeObject = this.canvas.getActiveObject() as FabricObject
  //   if (activeObject) {
  //     this.canvas.bringToFront(activeObject)
  //     if (!this.transactionHandler.active) {
  //       this.transactionHandler.save("bringToFront")
  //     }
  //     const { onModified } = this
  //     if (onModified) {
  //       onModified(activeObject)
  //     }
  //   }
  // }

  // /**
  //  * Send backwards
  //  * @returns
  //  */
  // public sendBackwards = () => {
  //   const activeObject = this.canvas.getActiveObject() as FabricObject
  //   if (activeObject) {
  //     const firstObject = this.canvas.getObjects()[1] as FabricObject
  //     if (firstObject.id === activeObject.id) {
  //       return
  //     }
  //     if (!this.transactionHandler.active) {
  //       this.transactionHandler.save("sendBackwards")
  //     }
  //     this.canvas.sendBackwards(activeObject)
  //     const { onModified } = this
  //     if (onModified) {
  //       onModified(activeObject)
  //     }
  //   }
  // }

  // /**
  //  * Send to back
  //  */
  // public sendToBack = () => {
  //   const activeObject = this.canvas.getActiveObject() as FabricObject
  //   if (activeObject) {
  //     this.canvas.sendToBack(activeObject)
  //     this.canvas.sendToBack(this.canvas.getObjects()[1])
  //     if (!this.transactionHandler.active) {
  //       this.transactionHandler.save("sendToBack")
  //     }
  //     const { onModified } = this
  //     if (onModified) {
  //       onModified(activeObject)
  //     }
  //   }
  // }

  /**
   * Check if the canvas is ready
   */
  public isReady() {
    return this.canvas.getObjects().length
  }

  /**
   * Return all objects except the workspace
   */
  public getObjects(objs?: FabricObject[]) {
    const objects = objs || this.canvas.getObjects()

    return objects.filter(({ id }) => id !== this.workspaceOptions.id)
  }

  /**
   * Return a list of objects from the selection
   * @param object - Fabric object
   */
  public getObjectsFromSelection(object?: FabricObject) {
    if (!object) return []

    return check.isActiveSelection(object) ? object.getObjects() : [object]
  }

  /**
   * Add object or selection to canvas
   * @param object - Fabric object to add
   * @param options - Options
   */
  public addObject(object: FabricObject) {
    for (const obj of this.getObjectsFromSelection(object)) {
      this.canvas.add(obj)
    }

    // Update active object and render canvas
    this.canvas.setActiveObject(object)
    this.canvas.requestRenderAll()
  }

  /**
   * Remove object or selection from canvas
   * @param object - Fabric object to remove
   * @param options - Options
   */
  public removeObject(object: FabricObject) {
    for (const obj of this.getObjectsFromSelection(object)) {
      this.canvas.remove(obj)
    }

    // Update active object and render canvas
    this.canvas.discardActiveObject()
    this.canvas.requestRenderAll()
  }

  /**
   * Clear canvas
   */
  public clear() {
    if (!this.isReady()) {
      return
    }

    this.getObjects().map((obj) => this.canvas.remove(obj))
    this.canvas.discardActiveObject()
    this.canvas.requestRenderAll()
  }

  // /**
  //  * Save target object as image
  //  * @param {FabricObject} targetObject
  //  * @param {string} [option={ name: 'New Image', format: 'png', quality: 1 }]
  //  */
  // public saveImage = (
  //   targetObject: FabricObject,
  //   option = { name: "New Image", format: "png", quality: 1 },
  // ) => {
  //   let dataUrl
  //   let target = targetObject
  //   if (target) {
  //     dataUrl = target.toDataURL(option)
  //   } else {
  //     target = this.canvas.getActiveObject() as FabricObject
  //     if (target) {
  //       dataUrl = target.toDataURL(option)
  //     }
  //   }
  //   if (dataUrl) {
  //     const anchorEl = document.createElement("a")
  //     anchorEl.href = dataUrl
  //     anchorEl.download = `${option.name}.png`
  //     document.body.appendChild(anchorEl)
  //     anchorEl.click()
  //     anchorEl.remove()
  //   }
  // }

  // /**
  //  * Save canvas as image
  //  * @param {string} [option={ name: 'New Image', format: 'png', quality: 1 }]
  //  */
  // public saveCanvasImage = (option = { name: "New Image", format: "png", quality: 1 }) => {
  //   // If it's zoomed out/in, the container will also include in the image
  //   // hence need to reset the zoom level.
  //   let { left, top, width, height, scaleX, scaleY } = this.workspace
  //   width = Math.ceil(width * scaleX)
  //   height = Math.ceil(height * scaleY)
  //   // cachedVT is used to reset the viewportTransform after the image is saved.
  //   const cachedVT = this.canvas.viewportTransform
  //   // reset the viewportTransform to default (no zoom)
  //   this.canvas.viewportTransform = [1, 0, 0, 1, 0, 0]
  //   const dataUrl = this.canvas.toDataURL({
  //     ...option,
  //     left,
  //     top,
  //     width,
  //     height,
  //     enableRetinaScaling: true,
  //   })

  //   if (dataUrl) {
  //     const anchorEl = document.createElement("a")
  //     anchorEl.href = dataUrl
  //     anchorEl.download = `${option.name}.png`
  //     document.body.appendChild(anchorEl)
  //     anchorEl.click()
  //     anchorEl.remove()
  //   }
  //   // reset the viewportTransform to previous value.
  //   this.canvas.viewportTransform = cachedVT
  // }

  // /**
  //  * Sets "angle" of an instance with centered rotation
  //  *
  //  * @param {number} angle
  //  */
  // public rotate = (angle: number) => {
  //   const activeObject = this.canvas.getActiveObject()
  //   if (activeObject) {
  //     this.set("rotation", angle)
  //     activeObject.rotate(angle)
  //     this.canvas.requestRenderAll()
  //   }
  // }

  /**
   * Destroy canvas
   */
  public destroy() {
    this.canvas.dispose()
    this.eventHandler.destroy()
    this.resizeObserver.disconnect()
    // this.guidelineHandler.destroy()
    // this.contextmenuHandler.destory()
    this.clear()
  }

  /**
   * Register hotkey handlers
   */
  public registerHotkeyHandlers(...handlers: HotkeyHandler[]) {
    for (const hotkey of handlers) {
      hotkeys(hotkey.key, { keyup: true }, (e) => {
        if (this.isReady()) {
          hotkey.handler(e)

          // If the hotkey is not "*", then prevent the default behavior
          if (hotkey.key !== "*") {
            return false
          }
        }
      })
    }
  }

  // /**
  //  * Set canvas option
  //  *
  //  * @param {CanvasOption} canvasOption
  //  */
  // public setCanvasOption = (canvasOption: CanvasOption) => {
  //   this.canvasOption = Object.assign({}, this.canvasOption, canvasOption)
  //   this.canvas.setBackgroundColor(
  //     canvasOption.backgroundColor,
  //     this.canvas.renderAll.bind(this.canvas),
  //   )
  //   if (typeof canvasOption.width !== "undefined" && typeof canvasOption.height !== "undefined") {
  //     if (this.eventHandler) {
  //       this.eventHandler.resize(canvasOption.width, canvasOption.height)
  //     } else {
  //       this.canvas.setWidth(canvasOption.width).setHeight(canvasOption.height)
  //     }
  //   }
  //   if (typeof canvasOption.selection !== "undefined") {
  //     this.canvas.selection = canvasOption.selection
  //   }
  //   if (typeof canvasOption.hoverCursor !== "undefined") {
  //     this.canvas.hoverCursor = canvasOption.hoverCursor
  //   }
  //   if (typeof canvasOption.defaultCursor !== "undefined") {
  //     this.canvas.defaultCursor = canvasOption.defaultCursor
  //   }
  //   if (typeof canvasOption.preserveObjectStacking !== "undefined") {
  //     this.canvas.preserveObjectStacking = canvasOption.preserveObjectStacking
  //   }
  // }
}

// export default Handler
