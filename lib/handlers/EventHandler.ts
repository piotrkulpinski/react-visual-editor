/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CanvasEvents } from "fabric"
import { InteractionMode } from "../utils/types"
import type Handler from "./Handler"

/**
 * Event Handler Class
 * @author salgum1114
 * @class EventHandler
 */
class EventHandler {
  handler: Handler

  /**
   * Whether is panning or not
   */
  isPanning: boolean

  /**
   * Whether middle button is clicked or not
   */
  isMiddleClicked: boolean

  constructor(handler: Handler) {
    this.handler = handler
    this.isPanning = false
    this.isMiddleClicked = false

    this.initialize()
  }

  /**
   * Attch event on document
   */
  public initialize() {
    this.handler.canvas.on({
      "object:modified": this.onObjectModified.bind(this),
      "mouse:down:before": this.onMouseDownBefore.bind(this),
      "mouse:down": this.onMouseDown.bind(this),
      "mouse:up:before": this.onMouseUpBefore.bind(this),
      "mouse:up": this.onMouseUp.bind(this),
      "mouse:move": this.onMouseMove.bind(this),
      // "selection:cleared": this.selection,
      // "selection:created": this.selection,
      // "selection:updated": this.selection,
    })
  }

  /**
   * Detach event on document
   */
  public destroy() {
    this.handler.canvas.off({
      "object:modified": this.onObjectModified,
      "mouse:down:before": this.onMouseDownBefore,
      "mouse:down": this.onMouseDown,
      "mouse:up:before": this.onMouseUpBefore,
      "mouse:up": this.onMouseUp,
      "mouse:move": this.onMouseMove,
      // "selection:cleared": this.selection,
      // "selection:created": this.selection,
      // "selection:updated": this.selection,
    })
  }

  /**
   * Modified event object
   */
  private onObjectModified = () => {
    this.handler.historyHandler.save()
  }

  /**
   * Mouse down before event
   */
  private onMouseDownBefore = ({ e }: CanvasEvents["mouse:down:before"]) => {
    if (e instanceof MouseEvent && e.button === 1) {
      this.handler.canvas.setCursor("grabbing")
      this.isMiddleClicked = true
    }
  }

  /**
   * Mouse down event
   */
  private onMouseDown = (_: CanvasEvents["mouse:down"]) => {
    if (this.handler.store.getState().interactionMode === InteractionMode.PAN) {
      this.handler.canvas.setCursor("grabbing")
      this.isPanning = true
      return
    }
  }

  /**
   * Mouse up before event
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onMouseUpBefore = (_: CanvasEvents["mouse:up:before"]) => {
    this.isMiddleClicked = false
  }

  /**
   * Mouse up event on canvas
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onMouseUp = (_: CanvasEvents["mouse:up"]) => {
    if (this.handler.store.getState().interactionMode === InteractionMode.PAN) {
      this.handler.canvas.setCursor("grab")
      this.isPanning = false
      return
    }
  }

  /**
   * Mouse move event on canvas
   */
  private onMouseMove = (e: CanvasEvents["mouse:move"]) => {
    if (this.handler.store.getState().interactionMode === InteractionMode.PAN) {
      this.handler.canvas.setCursor(this.isPanning ? "grabbing" : "grab")

      if (this.isPanning) {
        this.handler.interactionHandler.moving(e)
      }
    }

    if (this.isMiddleClicked) {
      this.handler.canvas.setCursor("grabbing")
      this.handler.interactionHandler.moving(e)
    }
  }

  /**
  //  * Selection event event on canvas
  //  */
  // private selection = (opt: IEvent<MouseEvent>) => {
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
  //  */
  // public keyup = (e: KeyboardEvent) => {
  //   if (!this.handler.shortcutHandler.isW(e)) {
  //     this.handler.interactionHandler.selection()
  //   }
  // }

  // /**
  //  * Context menu event on canvas
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
  //  */
  // public onmousedown = (_e: MouseEvent) => {
  //   this.handler.contextmenuHandler.hide()
  // }
}

export default EventHandler
