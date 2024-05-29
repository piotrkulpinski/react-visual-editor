import type Handler from "./Handler"

class HistoryHandler {
  handler: Handler

  constructor(handler: Handler) {
    this.handler = handler

    // this.handler.registerHotkeyHandlers(
    //   { key: "v", handler: () => this.setHistoryMode(HistoryMode.SELECT) },
    //   { key: "h", handler: () => this.setHistoryMode(HistoryMode.PAN) }
    // )
  }

  public undo() {
    // this.handler.canvas.undo();
  }
}

export default HistoryHandler
