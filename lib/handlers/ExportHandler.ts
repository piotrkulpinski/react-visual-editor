import { ImageFormat, util } from "fabric"
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
    const dataUrl = this.getCanvasDataUrl(format, quality, multiplier)

    // Save file
    this.saveFile(dataUrl, format)
  }

  /**
   * Export the current canvas to a clipboard
   * @param format The format of the image
   * @param quality The quality of the image
   * @param multiplier The multiplier of the image
   */
  public async exportToClipboard(quality = 0.9, multiplier = 1) {
    const dataUrl = this.getCanvasDataUrl("png", quality, multiplier)

    navigator.clipboard.write([
      new ClipboardItem({
        "image/png": fetch(dataUrl).then((response) => response.blob()),
      }),
    ])
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
    const blob = new Blob([JSON.stringify(json)], { type: "application/json" })

    // Save file
    this.saveFile(blob, "json")
  }

  /**
   * Get the data URL of the canvas
   * @param format The format of the image
   * @param quality The quality of the image
   * @param multiplier The multiplier of the image
   */
  private getCanvasDataUrl(format: ImageFormat, quality = 0.9, multiplier = 1) {
    const { canvas, workspace } = this.handler
    const { left, top, width, height } = workspace

    const zoom = canvas.getZoom()
    const activeObject = canvas.getActiveObject()
    const { translateX, translateY } = util.qrDecompose(canvas.viewportTransform)

    // Discard active object before exporting
    activeObject && canvas.discardActiveObject()

    const dataUrl = canvas.toDataURL({
      quality,
      format,
      multiplier: multiplier / zoom,
      width: width * zoom,
      height: height * zoom,
      left: left * zoom + translateX,
      top: top * zoom + translateY,
    })

    // Restore canvas
    canvas.requestRenderAll()

    // Restore active object
    activeObject && canvas.setActiveObject(activeObject)

    // Return data URL
    return dataUrl
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
