import { throttle } from "radash"
import { FabricObject, util } from "fabric"
import { Handler } from "./Handler"
import { create } from "zustand"

export type HistoryState = {
  history: string[]
  currentIndex: number
  canUndo: boolean
  canRedo: boolean
  setHistory: (history: string[]) => void
  incrementCurrentIndex: () => void
  decrementCurrentIndex: () => void
}

export const historyStore = create<HistoryState>((set) => ({
  history: [],
  currentIndex: -1,
  canUndo: false,
  canRedo: false,
  setHistory: (history) => set({ history }),
  incrementCurrentIndex: () =>
    set(({ history, currentIndex }) => {
      const newIndex = currentIndex + 1

      return {
        currentIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: newIndex < history.length - 1,
      }
    }),
  decrementCurrentIndex: () =>
    set(({ history, currentIndex }) => {
      const newIndex = currentIndex - 1

      return {
        currentIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: newIndex < history.length - 1,
      }
    }),
}))

export class HistoryHandler {
  handler: Handler

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

    const state = historyStore.getState()
    const currentState = this.getCurrentState()
    const previousState = state.history[state.currentIndex]

    // Check if the current state is different from the previous state
    if (!previousState || previousState !== currentState) {
      state.setHistory([...state.history.slice(0, state.currentIndex + 1), currentState])
      state.incrementCurrentIndex()
    }

    this.limitHistorySize()
  }

  /**
   * Undo last action
   */
  public undo = throttle({ interval: 50 }, () => {
    const state = historyStore.getState()
    if (!state.canUndo) return

    state.decrementCurrentIndex()
    this.replayState(state.history[state.currentIndex - 1])
  })

  /**
   * Redo last action
   */
  public redo = throttle({ interval: 50 }, () => {
    const state = historyStore.getState()
    if (!state.canRedo) return

    state.incrementCurrentIndex()
    this.replayState(state.history[state.currentIndex + 1])
  })

  /**
   * Get the current state of the canvas as a JSON string
   */
  private getCurrentState() {
    const rawJSON = this.handler.canvas.toDatalessJSON(this.propertiesToInclude)
    const objects = this.handler.getObjects(rawJSON.objects)

    return JSON.stringify(objects)
  }

  /**
   * Limit the size of the history stack to the maximum history size
   */
  private limitHistorySize() {
    const state = historyStore.getState()

    if (state.history.length > this.maxHistorySize) {
      historyStore.setState((state) => ({
        history: state.history.slice(-this.maxHistorySize),
        currentIndex: state.history.length - 1,
      }))
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
