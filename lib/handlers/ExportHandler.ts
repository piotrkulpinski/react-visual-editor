import { ImageFormat } from "fabric"
import { saveAs } from "file-saver"
import type Handler from "./Handler"

class ExportHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler
  }

  /**
   * Export the current canvas to an image
   * @param format The format of the image
   * @param quality The quality of the image
   * @param multiplier The multiplier of the image
   */
  public exportImage(format: ImageFormat, quality = 0.9, multiplier = 1) {
    const { canvas, workspace } = this.handler
    const { left, top, width, height } = workspace

    const zoom = canvas.getZoom()
    const viewportTransform = canvas.viewportTransform

    if (canvas.getActiveObject()) {
      canvas.discardActiveObject()
    }

    const result = canvas.toDataURL({
      quality,
      format,
      multiplier: multiplier / zoom,
      width: width * zoom,
      height: height * zoom,
      left: left * zoom + viewportTransform[4],
      top: top * zoom + viewportTransform[5],
    })

    // Save file
    this.saveFile(result, format)

    // Restore canvas
    canvas.renderAll()
  }

  /**
   * Export the current canvas to an SVG
   */
  public exportSVG() {
    const { canvas, workspace } = this.handler
    const { left, top, width, height } = workspace

    const data = canvas.toSVG(
      {
        viewBox: { x: left, y: top, width, height },
        width: `${width}px`,
        height: `${height}px`,
      },
      (e) => e
    )
    const blob = new Blob([data], { type: "image/svg+xml" })

    // Save file
    this.saveFile(blob, "svg")
  }

  /**
   * Export the current canvas to a JSON
   */
  public exportJSON() {
    const json = this.handler.canvas.toJSON()
    const blob = new Blob([JSON.stringify(json)])

    // Save file
    this.saveFile(blob, "json")
  }

  /**
   * Save the file to the user's computer
   * @param data The data to save
   * @param extension The extension of the file
   */
  private saveFile(data: string | Blob, extension: string) {
    saveAs(data, `${Date.now()}.${extension}`)
  }
}

export default ExportHandler
