import { ImageFormat, util } from "fabric"
import { saveAs } from "file-saver"
import { Handler } from "./Handler"

export class ExportHandler {
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
    const dataUrl = this.getCanvasAsDataUrl(format, quality, multiplier)

    // Save file
    this.saveFile(dataUrl, format)
  }

  /**
   * Export the current canvas to an SVG
   */
  public exportSVG() {
    const svg = this.getCanvasAsSVG()
    const blob = this.getBlobFromData(svg, { type: "image/svg+xml" })

    this.saveFile(blob, "svg")
  }

  /**
   * Export the current canvas to a JSON
   */
  public exportJSON() {
    const json = this.getCanvasAsJSON()
    const blob = this.getBlobFromData(json, { type: "application/json" })

    this.saveFile(blob, "json")
  }

  /**
   * Copy the current canvas image to a clipboard
   * @param format The format of the image
   * @param quality The quality of the image
   * @param multiplier The multiplier of the image
   */
  public copyImage(quality = 0.9, multiplier = 1) {
    const dataUrl = this.getCanvasAsDataUrl("png", quality, multiplier)

    navigator.clipboard.write([
      new ClipboardItem({ "image/png": fetch(dataUrl).then((response) => response.blob()) }),
    ])
  }

  /**
   * Copy the current canvas image to a clipboard
   * @param format The format of the image
   * @param quality The quality of the image
   * @param multiplier The multiplier of the image
   */
  public copyJSON() {
    const json = this.getCanvasAsJSON()

    navigator.clipboard.writeText(json)
  }

  /**
   * Get the SVG string of the canvas
   */
  private getCanvasAsSVG() {
    const { canvas, workspace } = this.handler
    const { left, top, width, height } = workspace

    return canvas.toSVG(
      {
        viewBox: { x: left, y: top, width, height },
        width: `${width}px`,
        height: `${height}px`,
      },
      (e) => e
    )
  }

  /**
   * Get the JSON string of the canvas
   */
  private getCanvasAsJSON() {
    const json = this.handler.canvas.toJSON()

    return JSON.stringify(json)
  }

  /**
   * Get the data URL of the canvas
   * @param format The format of the image
   * @param quality The quality of the image
   * @param multiplier The multiplier of the image
   */
  private getCanvasAsDataUrl(format: ImageFormat, quality = 0.9, multiplier = 1) {
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
   * Get a blob from the data
   * @param data The data to convert to a blob
   * @param options The options of the blob
   */
  private getBlobFromData(data: string | Blob, options?: BlobPropertyBag) {
    return !(data instanceof Blob) ? new Blob([data], options) : data
  }

  /**
   * Save the file to the user's computer
   * @param data The data to save
   * @param extension The extension of the file
   */
  private saveFile(data: string | Blob, extension: string) {
    // Save file
    saveAs(data, `${Date.now()}.${extension}`)
  }
}
