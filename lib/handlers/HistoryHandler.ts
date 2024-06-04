import { throttle } from "radash"
import { FabricObject, util } from "fabric"
import { Handler } from "./Handler"

export class HistoryHandler {
  handler: Handler

  private history: string[] = []
  private currentIndex: number = -1
  private isReplaying: boolean = false
  private readonly maxHistorySize: number = 100
  private readonly propertiesToInclude: (keyof FabricObject)[] = ["id"]

  constructor(handler: Handler) {
    this.handler = handler

    this.handler.registerHotkeyHandlers(
      { key: "cmd+z", handler: () => this.undo() },
      { key: "cmd+shift+z", handler: () => this.redo() }
    )

    // Save the initial empty state
    this.saveState()
  }

  /**
   * Save current state as history stack
   */
  public saveState = () => {
    if (this.isReplaying) return

    const currentState = this.getCurrentState()
    const previousState = this.history[this.currentIndex - 1]

    // Check if the current state is different from the previous state
    if (this.currentIndex === 0 || currentState !== previousState) {
      this.history = [...this.history.slice(0, this.currentIndex + 1), currentState]
      this.currentIndex++
    }

    this.limitHistorySize()
  }

  /**
   * Undo last action
   */
  public undo = throttle({ interval: 50 }, () => {
    if (this.currentIndex <= 0) return

    this.currentIndex--
    this.replayState(this.history[this.currentIndex])
  })

  /**
   * Redo last action
   */
  public redo = throttle({ interval: 50 }, () => {
    if (this.currentIndex >= this.history.length - 1) return

    this.currentIndex++
    this.replayState(this.history[this.currentIndex])
  })

  /**
   * Check if undo is possible
   */
  public get canUndo(): boolean {
    return this.currentIndex > 0
  }

  /**
   * Check if redo is possible
   */
  public get canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * Get the current state of the canvas as a JSON string
   */
  private getCurrentState(): string {
    const rawJSON = this.handler.canvas.toDatalessJSON(this.propertiesToInclude)
    const objects = this.handler.getObjects(rawJSON.objects)
    return JSON.stringify(objects)
  }

  /**
   * Limit the size of the history stack to the maximum history size
   */
  private limitHistorySize(): void {
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize)
      this.currentIndex = this.history.length - 1
    }
  }

  /**
   * Replay action from state
   *
   * @param state - State to replay
   */
  private replayState = (state: string) => {
    const objects = JSON.parse(state) as FabricObject[]

    this.isReplaying = true
    this.handler.canvas.renderOnAddRemove = false
    this.handler.clear()

    util.enlivenObjects(objects).then((objects) => {
      objects.forEach((object) => {
        const targetIndex = this.handler.canvas._objects.length
        this.handler.canvas.insertAt(targetIndex, object as FabricObject)
      })

      this.handler.canvas.renderOnAddRemove = true
      this.handler.canvas.requestRenderAll()
      this.isReplaying = false
    })
  }
}
