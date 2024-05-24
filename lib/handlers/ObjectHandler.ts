import { fabric } from "fabric"
import Handler from "./Handler"

class ObjectHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler
  }

  public addObject(object: fabric.Object) {
    this.handler.canvas.add(object)
    this.handler.canvas.setActiveObject(object)
  }

  public addText(text: string) {
    const textObject = new fabric.Textbox(text, {
      left: 10,
      top: 10,
      fill: "#000000",
      fontFamily: "Arial",
      fontSize: 20,
    })
    this.addObject(textObject)
  }

  public addRect() {
    const rect = new fabric.Rect({
      left: 10,
      top: 10,
      width: 100,
      height: 100,
      fill: "#000000",
    })
    this.addObject(rect)
  }
}

export default ObjectHandler
