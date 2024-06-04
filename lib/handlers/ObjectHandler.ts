import { FabricObject, Rect, Textbox } from "fabric"
import { Handler } from "./Handler"
import { getRandomColor } from "@curiousleaf/utils"

export class ObjectHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler

    this.handler.registerHotkeyHandlers(
      { key: "cmd+shift+1", handler: () => this.addRect() },
      { key: "cmd+shift+2", handler: () => this.addText("CSS is awesome") }
    )
  }

  public addText(text: string) {
    const object = new Textbox(text, {
      left: 10,
      top: 10,
      fill: "#000000",
      fontFamily: "Arial",
      fontSize: 16,
      width: 160,
    })

    this.addObject(object)
  }

  public addRect() {
    const object = new Rect({
      left: 10,
      top: 10,
      width: 100,
      height: 100,
      fill: `#${getRandomColor()}`,
    })

    this.addObject(object)
  }

  private addObject(object: FabricObject) {
    this.handler.addObject(object)
    this.handler.canvas.setActiveObject(object)
    this.handler.canvas.requestRenderAll()
  }
}
