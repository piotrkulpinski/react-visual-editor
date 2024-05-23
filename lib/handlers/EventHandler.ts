import type { fabric } from "fabric"
import { InteractionMode } from "../utils/types"
import type Handler from "./Handler"

/**
 * Event Handler Class
 * @author salgum1114
 * @class EventHandler
 */
class EventHandler {
  handler: Handler
  panning: boolean

  constructor(handler: Handler) {
    this.handler = handler
    this.panning = false
    this.initialize()
  }

  /**
   * Attch event on document
   */
  public initialize() {
    this.handler.canvas.on({
      // "object:modified": this.modified,
      // "object:scaling": this.scaling,
      // "object:scaled": this.scaled,
      // "object:moving": this.moving,
      // "object:moved": this.moved,
      // "object:rotating": this.rotating,
      // "object:rotated": this.rotated,
      "mouse:wheel": this.mousewheel,
      "mouse:down": this.mousedown,
      "mouse:up": this.mouseup,
      "mouse:move": this.mousemove,
      // "selection:cleared": this.selection,
      // "selection:created": this.selection,
      // "selection:updated": this.selection,
    })

    if (this.handler.canvas.wrapperEl) {
      // this.handler.canvas.wrapperEl.addEventListener("keydown", this.keydown, false)
      // this.handler.canvas.wrapperEl.addEventListener("keyup", this.keyup, false)
      // this.handler.canvas.wrapperEl.addEventListener("mousedown", this.onmousedown, false)
      // this.handler.canvas.wrapperEl.addEventListener("contextmenu", this.contextmenu, false)
      // if (this.handler.keyEvent?.clipboard) {
      //   document.addEventListener("paste", this.paste, false)
      // }
    }
  }

  /**
   * Detach event on document
   */
  public destroy = () => {
    this.handler.canvas.off({
      // "object:modified": this.modified,
      // "object:scaling": this.scaling,
      // "object:moving": this.moving,
      // "object:moved": this.moved,
      // "object:rotating": this.rotating,
      "mouse:wheel": this.mousewheel,
      "mouse:down": this.mousedown,
      "mouse:up": this.mouseup,
      "mouse:move": this.mousemove,
      // "selection:cleared": this.selection,
      // "selection:created": this.selection,
      // "selection:updated": this.selection,
    })

    if (this.handler.canvas.wrapperEl) {
      // this.handler.canvas.wrapperEl.removeEventListener("keydown", this.keydown)
      // this.handler.canvas.wrapperEl.removeEventListener("keyup", this.keyup)
      // this.handler.canvas.wrapperEl.removeEventListener("mousedown", this.onmousedown)
      // this.handler.canvas.wrapperEl.removeEventListener("contextmenu", this.contextmenu)
      // if (this.handler.keyEvent?.clipboard) {
      //   this.handler.canvas.wrapperEl.removeEventListener("paste", this.paste)
      // }
    }
  }

  /**
   * Modified event object
   *
   * @param {FabricEvent} opt
   * @returns
   */
  // public modified = (opt: FabricEvent) => {
  //   const { target } = opt
  //   if (!target) {
  //     return
  //   }
  //   if (target.type === "circle" && target.parentId) {
  //     return
  //   }
  //   const { onModified } = this.handler
  //   if (onModified) {
  //     onModified(target)
  //   }
  // }

  // /**
  //  * Moving event object
  //  *
  //  * @param {FabricEvent} opt
  //  * @returns
  //  */
  // public moving = ({ target }: FabricEvent) => {
  //   if (this.handler.editable && this.handler.guidelineOption.enabled) {
  //     this.handler.guidelineHandler.movingGuidelines(target)
  //   }
  // }

  // /**
  //  * Moved event object
  //  *
  //  * @param {FabricEvent} opt
  //  */
  // public moved = ({ target }: FabricEvent) => {
  //   if (!this.handler.transactionHandler.active) {
  //     this.handler.transactionHandler.save("moved")
  //   }
  // }

  // /**
  //  * Scaling event object
  //  *
  //  * @param {FabricEvent} opt
  //  */
  // public scaling = ({ target }: FabricEvent) => {}

  // /**
  //  * Scaled event object
  //  *
  //  * @param {FabricEvent} opt
  //  */
  // public scaled = (_opt: FabricEvent) => {
  //   if (!this.handler.transactionHandler.active) {
  //     this.handler.transactionHandler.save("scaled")
  //   }
  // }

  // /**
  //  * Rotating event object
  //  *
  //  * @param {FabricEvent} opt
  //  */
  // public rotating = ({ target }: FabricEvent) => {}

  // /**
  //  * Rotated event object
  //  *
  //  * @param {FabricEvent} opt
  //  */
  // public rotated = (_opt: FabricEvent) => {
  //   if (!this.handler.transactionHandler.active) {
  //     this.handler.transactionHandler.save("rotated")
  //   }
  // }

  // /**
  //  * Moing object at keyboard arrow key down event
  //  *
  //  * @param {KeyboardEvent} e
  //  * @returns
  //  */
  // public arrowmoving = (e: KeyboardEvent) => {
  //   const activeObject = this.handler.canvas.getActiveObject() as FabricObject

  //   if (!activeObject) {
  //     return false
  //   }

  //   if (activeObject.id === "workarea") {
  //     return false
  //   }

  //   if (e.code === code.ARROW_UP) {
  //     activeObject.set("top", activeObject.top - 2)
  //     activeObject.setCoords()
  //     this.handler.canvas.renderAll()
  //     return true
  //   }

  //   if (e.code === code.ARROW_DOWN) {
  //     activeObject.set("top", activeObject.top + 2)
  //     activeObject.setCoords()
  //     this.handler.canvas.renderAll()
  //     return true
  //   }

  //   if (e.code === code.ARROW_LEFT) {
  //     activeObject.set("left", activeObject.left - 2)
  //     activeObject.setCoords()
  //     this.handler.canvas.renderAll()
  //     return true
  //   }

  //   if (e.code === code.ARROW_RIGHT) {
  //     activeObject.set("left", activeObject.left + 2)
  //     activeObject.setCoords()
  //     this.handler.canvas.renderAll()
  //     return true
  //   }

  //   if (this.handler.onModified) {
  //     this.handler.onModified(activeObject)
  //   }

  //   return true
  // }

  /**
   * Zoom at mouse wheel event
   *
   * @param {FabricEvent<WheelEvent>} opt
   * @returns
   */
  public mousewheel = ({ e }: fabric.IEvent<WheelEvent>) => {
    if (!this.handler.zoomOptions.enabled) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    const zoom = this.handler.canvas.getZoom()
    this.handler.zoomHandler.setZoom(zoom * 0.999 ** e.deltaY, e.layerX, e.layerY)
  }

  /**
   * Mouse down event on object
   *
   * @param {FabricEvent<MouseEvent>} opt
   * @returns
   */
  public mousedown = ({ target }: fabric.IEvent<MouseEvent>) => {
    if (this.handler.store.getState().interactionMode === InteractionMode.PAN) {
      this.handler.canvas.setCursor("grabbing")
      this.panning = true
      return
    }

    // if (editable) {
    //   this.handler.guidelineHandler.viewportTransform = this.handler.canvas.viewportTransform
    //   this.handler.guidelineHandler.zoom = this.handler.canvas.getZoom()
    //   if (this.handler.interactionMode === "selection") {
    //     this.handler.prevTarget = target
    //     return
    //   }
    // }
  }

  /**
   * Mouse up event on canvas
   *
   * @param {FabricEvent<MouseEvent>} opt
   * @returns
   */
  public mouseup = ({ e }: fabric.IEvent<MouseEvent>) => {
    if (this.handler.store.getState().interactionMode === InteractionMode.PAN) {
      this.handler.canvas.setCursor("grab")
      this.panning = false
      return
    }

    // if (this.handler.guidelineOption.enabled) {
    //   this.handler.guidelineHandler.verticalLines.length = 0
    //   this.handler.guidelineHandler.horizontalLines.length = 0
    // }

    // this.handler.canvas.renderAll()
  }

  /**
   * Mouse move event on canvas
   *
   * @param {FabricEvent<MouseEvent>} opt
   * @returns
   */
  public mousemove = ({ e }: fabric.IEvent<MouseEvent>) => {
    if (this.handler.store.getState().interactionMode === InteractionMode.PAN) {
      this.handler.canvas.setCursor(this.panning ? "grabbing" : "grab")

      if (this.panning) {
        this.handler.interactionHandler.moving(e)
        this.handler.canvas.requestRenderAll()
      }
    }
  }

  /**
   * Mouse out event on canvas
   *
   * @param {FabricEvent<MouseEvent>} opt
   */
  public mouseout = ({ target }: fabric.IEvent<MouseEvent>) => {
    if (!target) {
    }
  }

  /**
  //  * Selection event event on canvas
  //  *
  //  * @param {FabricEvent} opt
  //  */
  // public selection = (opt: IEvent<MouseEvent>) => {
  //   const { onSelect, activeSelectionOption } = this.handler
  //   const target = opt.target as FabricObject<fabric.ActiveSelection>
  //   if (target && target.type === "activeSelection") {
  //     target.set({
  //       ...activeSelectionOption,
  //     })
  //   }
  //   if (onSelect) {
  //     onSelect(target)
  //   }
  // }

  // /**
  //  * Called resize event on canvas
  //  *
  //  * @param {number} nextWidth
  //  * @param {number} nextHeight
  //  * @returns
  //  */
  // public resize = (nextWidth: number, nextHeight: number) => {
  //   this.handler.canvas.setWidth(nextWidth).setHeight(nextHeight)
  //   this.handler.canvas.setBackgroundColor(
  //     this.handler.canvasOption.backgroundColor,
  //     this.handler.canvas.renderAll.bind(this.handler.canvas),
  //   )
  //   if (!this.handler.workarea) {
  //     return
  //   }
  //   const diffWidth = nextWidth / 2 - this.handler.width / 2
  //   const diffHeight = nextHeight / 2 - this.handler.height / 2
  //   this.handler.width = nextWidth
  //   this.handler.height = nextHeight
  //   if (this.handler.workarea.layout === "fixed") {
  //     this.handler.canvas.centerObject(this.handler.workarea)
  //     this.handler.workarea.setCoords()

  //     this.handler.canvas.getObjects().forEach((obj: FabricObject) => {
  //       if (obj.id !== "workarea") {
  //         const left = obj.left + diffWidth
  //         const top = obj.top + diffHeight
  //         obj.set({
  //           left,
  //           top,
  //         })
  //         obj.setCoords()
  //       }
  //     })
  //     this.handler.canvas.requestRenderAll()
  //     return
  //   }
  //   if (this.handler.workarea.layout === "responsive") {
  //     const deltaPoint = new fabric.Point(diffWidth, diffHeight)
  //     this.handler.canvas.relativePan(deltaPoint)
  //     this.handler.zoomHandler.setZoomToFit()
  //     return
  //   }
  //   const scaleX = nextWidth / this.handler.workarea.width
  //   const scaleY = nextHeight / this.handler.workarea.height
  //   const diffScaleX = nextWidth / (this.handler.workarea.width * this.handler.workarea.scaleX)
  //   const diffScaleY = nextHeight / (this.handler.workarea.height * this.handler.workarea.scaleY)
  //   this.handler.workarea.set({
  //     scaleX,
  //     scaleY,
  //   })
  //   this.handler.canvas.getObjects().forEach((obj: FabricObject) => {
  //     if (obj.id !== "workarea") {
  //       const left = obj.left * diffScaleX
  //       const top = obj.top * diffScaleY
  //       const newScaleX = obj.scaleX * diffScaleX
  //       const newScaleY = obj.scaleY * diffScaleY
  //       obj.set({
  //         scaleX: newScaleX,
  //         scaleY: newScaleY,
  //         left,
  //         top,
  //       })
  //       obj.setCoords()
  //     }
  //   })
  //   this.handler.canvas.renderAll()
  // }

  // /**
  //  * Paste event on canvas
  //  *
  //  * @param {ClipboardEvent} e
  //  * @returns
  //  */
  // public paste = async (e: ClipboardEvent) => {
  //   if (this.handler.canvas.wrapperEl !== document.activeElement) {
  //     return false
  //   }
  //   if (e.preventDefault) {
  //     e.preventDefault()
  //   }
  //   if (e.stopPropagation) {
  //     e.stopPropagation()
  //   }
  //   const clipboardData = e.clipboardData
  //   if (clipboardData.types.length) {
  //     clipboardData.types.forEach((clipboardType: string) => {
  //       if (clipboardType === "text/plain") {
  //         const textPlain = clipboardData.getData("text/plain")
  //         try {
  //           const objects = JSON.parse(textPlain)
  //           const padding = this.handler.isCut ? 0 : 10
  //           if (objects && Array.isArray(objects)) {
  //             const filteredObjects = objects.filter(obj => obj !== null)
  //             if (filteredObjects.length === 1) {
  //               const obj = filteredObjects[0]
  //               if (typeof obj.cloneable !== "undefined" && !obj.cloneable) {
  //                 return
  //               }
  //               obj.left = obj.properties.left + padding
  //               obj.top = obj.properties.top + padding
  //               const createdObj = this.handler.add(obj, false, true)
  //               this.handler.canvas.setActiveObject(createdObj as FabricObject)
  //               this.handler.canvas.requestRenderAll()
  //               this.handler.onAdd?.(createdObj)
  //             } else {
  //               const nodes = [] as any[]
  //               const targets = [] as any[]
  //               objects.forEach(obj => {
  //                 if (!obj) {
  //                   return
  //                 }

  //                 obj.left = obj.properties.left + padding
  //                 obj.top = obj.properties.top + padding

  //                 const createdObj = this.handler.add(obj, false, true)

  //                 targets.push(createdObj)
  //               })
  //               const activeSelection = new fabric.ActiveSelection(nodes.length ? nodes : targets, {
  //                 canvas: this.handler.canvas,
  //                 ...this.handler.activeSelectionOption,
  //               })
  //               this.handler.canvas.setActiveObject(activeSelection)
  //               this.handler.canvas.requestRenderAll()
  //               this.handler.onAdd?.(activeSelection)
  //             }
  //             if (!this.handler.transactionHandler.active) {
  //               this.handler.transactionHandler.save("paste")
  //             }
  //             this.handler.isCut = false
  //             this.handler.copy()
  //           }
  //         } catch (error) {
  //           console.error(error)
  //           // const item = {
  //           //     id: uuv4id(),
  //           //     type: 'textbox',
  //           //     text: textPlain,
  //           // };
  //           // this.handler.add(item, true);
  //         }
  //       } else if (clipboardType === "text/html") {
  //         // Todo ...
  //         // const textHtml = clipboardData.getData('text/html');
  //         // console.log(textHtml);
  //       } else if (clipboardType === "Files") {
  //         // Array.from(clipboardData.files).forEach((file) => {
  //         //     const { type } = file;
  //         //     if (type === 'image/png' || type === 'image/jpeg' || type === 'image/jpg') {
  //         //         const item = {
  //         //             id: uuid(),
  //         //             type: 'image',
  //         //             file,
  //         //             superType: 'image',
  //         //         };
  //         //         this.handler.add(item, true);
  //         //     } else {
  //         //         console.error('Not supported file type');
  //         //     }
  //         // });
  //       }
  //     })
  //   }
  //   return true
  // }

  /**
   * Keydown event on document
   *
   * @param {KeyboardEvent} e
   */
  // public keydown = (e: KeyboardEvent) => {
  //   const { keyEvent, editable } = this.handler
  //   if (!Object.keys(keyEvent).length) {
  //     return
  //   }
  //   const { clipboard, grab } = keyEvent
  //   if (this.handler.shortcutHandler.isW(e) && grab) {
  //     this.code = e.code
  //     this.handler.interactionHandler.grab()
  //     return
  //   }
  //   if (e.altKey && editable && grab) {
  //     this.handler.interactionHandler.grab()
  //     return
  //   }
  //   if (this.handler.shortcutHandler.isEscape(e)) {
  //     if (this.handler.interactionMode === "selection") {
  //       this.handler.canvas.discardActiveObject()
  //       this.handler.canvas.renderAll()
  //     }
  //   }
  //   if (this.handler.canvas.wrapperEl !== document.activeElement) {
  //     return
  //   }
  //   if (editable) {
  //     if (this.handler.shortcutHandler.isQ(e)) {
  //       this.code = e.code
  //     } else if (this.handler.shortcutHandler.isDelete(e)) {
  //       this.handler.remove()
  //     } else if (this.handler.shortcutHandler.isArrow(e)) {
  //       this.arrowmoving(e)
  //     } else if (this.handler.shortcutHandler.isCtrlA(e)) {
  //       e.preventDefault()
  //       this.handler.selectAll()
  //     } else if (this.handler.shortcutHandler.isCtrlC(e)) {
  //       e.preventDefault()
  //       this.handler.copy()
  //     } else if (this.handler.shortcutHandler.isCtrlV(e) && !clipboard) {
  //       e.preventDefault()
  //       this.handler.paste()
  //     } else if (this.handler.shortcutHandler.isCtrlX(e)) {
  //       e.preventDefault()
  //       this.handler.cut()
  //     } else if (this.handler.shortcutHandler.isCtrlZ(e)) {
  //       e.preventDefault()
  //       this.handler.transactionHandler.undo()
  //     } else if (this.handler.shortcutHandler.isCtrlY(e)) {
  //       e.preventDefault()
  //       this.handler.transactionHandler.redo()
  //     } else if (this.handler.shortcutHandler.isPlus(e)) {
  //       e.preventDefault()
  //       this.handler.zoomHandler.setZoomIn()
  //     } else if (this.handler.shortcutHandler.isMinus(e)) {
  //       e.preventDefault()
  //       this.handler.zoomHandler.setZoomOut()
  //     } else if (this.handler.shortcutHandler.isO(e)) {
  //       e.preventDefault()
  //       this.handler.zoomHandler.setZoom(1)
  //     } else if (this.handler.shortcutHandler.isP(e)) {
  //       e.preventDefault()
  //       this.handler.zoomHandler.setZoomToFit()
  //     }
  //     return
  //   }
  //   return
  // }

  // /**
  //  * Key up event on canvas
  //  *
  //  * @param {KeyboardEvent} e
  //  */
  // public keyup = (e: KeyboardEvent) => {
  //   if (!this.handler.shortcutHandler.isW(e)) {
  //     this.handler.interactionHandler.selection()
  //   }
  // }

  // /**
  //  * Context menu event on canvas
  //  *
  //  * @param {MouseEvent} e
  //  */
  // public contextmenu = (e: MouseEvent) => {
  //   e.preventDefault()
  //   const { editable, onContext } = this.handler
  //   if (editable && onContext) {
  //     const target = this.handler.canvas.findTarget(e, false) as FabricObject
  //     if (target && target.type !== "activeSelection") {
  //       this.handler.select(target)
  //     }
  //     this.handler.contextmenuHandler.show(e, target)
  //   }
  // }

  // /**
  //  * Mouse down event on canvas
  //  *
  //  * @param {MouseEvent} _e
  //  */
  // public onmousedown = (_e: MouseEvent) => {
  //   this.handler.contextmenuHandler.hide()
  // }
}

export default EventHandler
