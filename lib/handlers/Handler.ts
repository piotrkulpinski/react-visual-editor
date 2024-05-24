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
import EventHandler from "./EventHandler"
import InteractionHandler from "./InteractionHandler"
import WorkspaceHandler, { defaultWorkspaceOptions } from "./WorkspaceHandler"
import ZoomHandler, { defaultZoomOptions } from "./ZoomHandler"
import NudgeHandler from "./NudgeHandler"
import RulerHandler, { defaultRulerOptions } from "./RulerHandler"
import DrawingHandler from "./DrawingHandler"
import ObjectHandler from "./ObjectHandler"
import ControlsHandler from "./ControlsHandler"
import { Canvas, CanvasOptions, FabricObject } from "fabric"
import { Rect } from "fabric"

export type HandlerStore = {
  zoom: number
  rulerEnabled: boolean
  interactionMode: InteractionMode
}

/**
 * Main handler for Canvas
 */
class Handler implements HandlerOptions {
  public id: string
  public canvas: Canvas
  public canvasOptions?: Partial<CanvasOptions>
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
  public interactionHandler: InteractionHandler
  public nudgeHandler: NudgeHandler
  public rulerHandler: RulerHandler
  public objectHandler: ObjectHandler
  public controlsHandler: ControlsHandler
  public eventHandler: EventHandler
  // public imageHandler: ImageHandler
  // public contextmenuHandler: ContextmenuHandler
  // public workareaHandler: WorkareaHandler
  // public transactionHandler: TransactionHandler
  // public alignmentHandler: AlignmentHandler
  // public guidelineHandler: GuidelineHandler
  // public shortcutHandler: ShortcutHandler

  constructor(options: HandlerOptions) {
    // Options
    this.id = options.id
    this.canvas = options.canvas
    this.container = options.container
    this.canvasOptions = options.canvasOptions

    // Store
    this.store = createStore(() => ({
      zoom: this.canvas.getZoom(),
      rulerEnabled: true,
      interactionMode: InteractionMode.SELECT,
    }))

    this.zoomOptions = Object.assign({}, defaultZoomOptions, options.zoomOptions)
    this.workspaceOptions = Object.assign({}, defaultWorkspaceOptions, options.workspaceOptions)
    this.rulerOptions = Object.assign({}, defaultRulerOptions, options.rulerOptions)
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
    this.interactionHandler = new InteractionHandler(this)
    this.nudgeHandler = new NudgeHandler(this)
    this.rulerHandler = new RulerHandler(this)
    this.objectHandler = new ObjectHandler(this)
    this.controlsHandler = new ControlsHandler(this)
    // this.imageHandler = new ImageHandler(this)
    // this.contextmenuHandler = new ContextmenuHandler(this)
    // this.transactionHandler = new TransactionHandler(this)
    // this.alignmentHandler = new AlignmentHandler(this)
    // this.guidelineHandler = new GuidelineHandler(this)
    // this.shortcutHandler = new ShortcutHandler(this)
    this.eventHandler = new EventHandler(this)

    // Resize Observer
    this.resizeObserver = new ResizeObserver(
      debounce({ delay: 25 }, () => {
        this.workspaceHandler.resizeWorkspace()
      })
    )

    this.resizeObserver.observe(this.container)
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
  //  * Add object
  //  * @param {FabricObjectOption} obj
  //  * @param {boolean} [centered=true]
  //  * @param {boolean} [loaded=false]
  //  * @param {boolean} [group=false]
  //  * @returns
  //  */
  // public add = (obj: FabricObjectOption, centered = true, loaded = false, group = false) => {
  //   const { editable, onAdd, objectOption } = this
  //   const option: any = {
  //     hasControls: editable,
  //     hasBorders: editable,
  //     selectable: editable,
  //     lockMovementX: !editable,
  //     lockMovementY: !editable,
  //     hoverCursor: !editable ? "pointer" : "move",
  //   }
  //   if (obj.type === "i-text") {
  //     option.editable = false
  //   } else {
  //     option.editable = editable
  //   }
  //   if (editable && this.workarea?.layout === "fullscreen") {
  //     option.scaleX = this.workarea.scaleX
  //     option.scaleY = this.workarea.scaleY
  //   }
  //   const newOption = Object.assign(
  //     {},
  //     objectOption,
  //     obj,
  //     {
  //       container: this.container.id,
  //       editable,
  //     },
  //     option,
  //   )
  //   let createdObj
  //   // Create canvas object
  //   if (obj.type === "image") {
  //     createdObj = this.addImage(newOption)
  //   } else if (obj.type === "group") {
  //     createdObj = this.addGroup(newOption)
  //   } else {
  //     createdObj = this.fabricObjects[obj.type].create(newOption)
  //   }
  //   if (group) {
  //     return createdObj
  //   }
  //   this.canvas.add(createdObj)
  //   this.objects = this.getObjects()
  //   if (!editable) {
  //     createdObj.on("mousedown", this.eventHandler.object.mousedown)
  //   }
  //   if (createdObj.dblclick) {
  //     createdObj.on("mousedblclick", this.eventHandler.object.mousedblclick)
  //   }
  //   if (editable && !loaded) {
  //     this.centerObject(createdObj, centered)
  //   }
  //   if (!this.transactionHandler.active && !loaded) {
  //     this.transactionHandler.save("add")
  //   }
  //   if (onAdd && editable && !loaded) {
  //     onAdd(createdObj)
  //   }
  //   return createdObj
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
  //  * Remove object
  //  * @param {FabricObject} target
  //  * @returns {any}
  //  */
  // public remove = (target?: FabricObject) => {
  //   const activeObject = target || (this.canvas.getActiveObject() as any)

  //   if (!activeObject) {
  //     return
  //   }
  //   if (typeof activeObject.deletable !== "undefined" && !activeObject.deletable) {
  //     return
  //   }
  //   if (activeObject.type !== "activeSelection") {
  //     this.canvas.discardActiveObject()
  //     this.canvas.remove(activeObject)
  //   } else {
  //     const { _objects: activeObjects } = activeObject
  //     const existDeleted = activeObjects.some(
  //       (obj: any) => typeof obj.deletable !== "undefined" && !obj.deletable,
  //     )
  //     if (existDeleted) {
  //       return
  //     }
  //     this.canvas.discardActiveObject()
  //     activeObjects.forEach((obj: any) => {
  //       this.canvas.remove(obj)
  //     })
  //   }
  //   if (!this.transactionHandler.active) {
  //     this.transactionHandler.save("remove")
  //   }
  //   this.objects = this.getObjects()
  //   const { onRemove } = this
  //   if (onRemove) {
  //     onRemove(activeObject)
  //   }
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
  //  * Duplicate object
  //  * @returns
  //  */
  // public duplicate = () => {
  //   const { onAdd, propertiesToInclude } = this
  //   const activeObject = this.canvas.getActiveObject() as FabricObject
  //   if (!activeObject) {
  //     return
  //   }
  //   if (typeof activeObject.cloneable !== "undefined" && !activeObject.cloneable) {
  //     return
  //   }
  //   activeObject.clone((clonedObj: FabricObject) => {
  //     this.canvas.discardActiveObject()
  //     clonedObj.set({
  //       left: clonedObj.left + 10,
  //       top: clonedObj.top + 10,
  //       evented: true,
  //     })
  //     if (clonedObj.type === "activeSelection") {
  //       const activeSelection = clonedObj as fabric.ActiveSelection
  //       activeSelection.canvas = this.canvas
  //       activeSelection.forEachObject((obj: any) => {
  //         obj.set("id", uuid())
  //         this.canvas.add(obj)
  //         this.objects = this.getObjects()
  //         if (obj.dblclick) {
  //           obj.on("mousedblclick", this.eventHandler.object.mousedblclick)
  //         }
  //       })
  //       if (onAdd) {
  //         onAdd(activeSelection)
  //       }
  //       activeSelection.setCoords()
  //     } else {
  //       if (activeObject.id === clonedObj.id) {
  //         clonedObj.set("id", uuid())
  //       }
  //       this.canvas.add(clonedObj)
  //       this.objects = this.getObjects()
  //       if (clonedObj.dblclick) {
  //         clonedObj.on("mousedblclick", this.eventHandler.object.mousedblclick)
  //       }
  //       if (onAdd) {
  //         onAdd(clonedObj)
  //       }
  //     }
  //     this.canvas.setActiveObject(clonedObj)
  //     this.canvas.requestRenderAll()
  //   }, propertiesToInclude)
  // }

  // /**
  //  * Duplicate object by id
  //  * @param {string} id
  //  * @returns
  //  */
  // public duplicateById = (id: string) => {
  //   const { onAdd, propertiesToInclude } = this
  //   const findObject = this.findById(id)
  //   if (findObject) {
  //     if (typeof findObject.cloneable !== "undefined" && !findObject.cloneable) {
  //       return false
  //     }
  //     findObject.clone((cloned: FabricObject) => {
  //       cloned.set({
  //         left: cloned.left + 10,
  //         top: cloned.top + 10,
  //         id: uuid(),
  //         evented: true,
  //       })
  //       this.canvas.add(cloned)
  //       this.objects = this.getObjects()
  //       if (onAdd) {
  //         onAdd(cloned)
  //       }
  //       if (cloned.dblclick) {
  //         cloned.on("mousedblclick", this.eventHandler.object.mousedblclick)
  //       }
  //       this.canvas.setActiveObject(cloned)
  //       this.canvas.requestRenderAll()
  //     }, propertiesToInclude)
  //   }
  //   return true
  // }

  // /**
  //  * Cut object
  //  *
  //  */
  // public cut = () => {
  //   this.copy()
  //   this.remove()
  //   this.isCut = true
  // }

  // /**
  //  * Copy to clipboard
  //  *
  //  * @param {*} value
  //  */
  // public copyToClipboard = (value: any) => {
  //   const textarea = document.createElement("textarea")
  //   document.body.appendChild(textarea)
  //   textarea.value = value
  //   textarea.select()
  //   document.execCommand("copy")
  //   document.body.removeChild(textarea)
  //   this.canvas.wrapperEl.focus()
  // }

  // /**
  //  * Copy object
  //  *
  //  * @returns
  //  */
  // public copy = () => {
  //   const { propertiesToInclude } = this
  //   const activeObject = this.canvas.getActiveObject() as FabricObject
  //   if (activeObject) {
  //     if (typeof activeObject.cloneable !== "undefined" && !activeObject.cloneable) {
  //       return false
  //     }

  //     activeObject.clone((cloned: FabricObject) => {
  //       if (this.keyEvent.clipboard) {
  //         this.copyToClipboard(JSON.stringify(cloned.toObject(propertiesToInclude), null, "\t"))
  //       } else {
  //         this.clipboard = cloned
  //       }
  //     }, propertiesToInclude)
  //   }
  //   return true
  // }

  // /**
  //  * Paste object
  //  *
  //  * @returns
  //  */
  // public paste = () => {
  //   const { onAdd, propertiesToInclude, clipboard, isCut } = this
  //   const padding = isCut ? 0 : 10
  //   if (!clipboard) {
  //     return false
  //   }
  //   if (typeof clipboard.cloneable !== "undefined" && !clipboard.cloneable) {
  //     return false
  //   }
  //   this.isCut = false
  //   clipboard.clone((clonedObj: any) => {
  //     this.canvas.discardActiveObject()
  //     clonedObj.set({
  //       left: clonedObj.left + padding,
  //       top: clonedObj.top + padding,
  //       id: isCut ? clipboard.id : uuid(),
  //       evented: true,
  //     })
  //     if (clonedObj.type === "activeSelection") {
  //       clonedObj.canvas = this.canvas
  //       clonedObj.forEachObject((obj: any) => {
  //         obj.set("id", isCut ? obj.id : uuid())
  //         this.canvas.add(obj)
  //         if (obj.dblclick) {
  //           obj.on("mousedblclick", this.eventHandler.object.mousedblclick)
  //         }
  //       })
  //     } else {
  //       this.canvas.add(clonedObj)
  //       if (clonedObj.dblclick) {
  //         clonedObj.on("mousedblclick", this.eventHandler.object.mousedblclick)
  //       }
  //     }
  //     const newClipboard = clipboard.set({
  //       top: clonedObj.top,
  //       left: clonedObj.left,
  //     })
  //     if (isCut) {
  //       this.clipboard = null
  //     } else {
  //       this.clipboard = newClipboard
  //     }
  //     if (!this.transactionHandler.active) {
  //       this.transactionHandler.save("paste")
  //     }
  //     // TODO...
  //     // After toGroup svg elements not rendered.
  //     this.objects = this.getObjects()
  //     if (onAdd) {
  //       onAdd(clonedObj)
  //     }
  //     clonedObj.setCoords()
  //     this.canvas.setActiveObject(clonedObj)
  //     this.canvas.requestRenderAll()
  //   }, propertiesToInclude)
  //   return true
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
  public getObjects() {
    return this.canvas.getObjects().filter(({ id }) => id !== this.workspaceOptions.id)
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
    this.canvas.renderAll()
  }

  /**
   * Center the canvas on the center point of the workspace
   *
   * @param object - The object to center the canvas on
   */
  public setCenterFromObject(object: Rect) {
    const { x, y } = object.getCenterPoint()
    const { width, height, viewportTransform } = this.canvas

    if (width === undefined || height === undefined || !viewportTransform) {
      return
    }

    viewportTransform[4] = width / 2 - x * (viewportTransform[0] ?? 1)
    viewportTransform[5] = height / 2 - y * (viewportTransform[3] ?? 1)
    this.canvas.setViewportTransform(viewportTransform)
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

export default Handler
