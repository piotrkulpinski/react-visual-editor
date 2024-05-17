import { create } from "zustand"
import { devtools } from "zustand/middleware"

type EditorState = {
  zoomLevel: number
  zoomLevels: number[]
  setZoomLevel: (zoomLevel: number) => void
}

const useEditorStore = create<EditorState>()(
  devtools(
    set => ({
      zoomLevel: 1,
      zoomLevels: [0.25, 0.5, 0.75, 1, 1.5, 2, 4],
      setZoomLevel: zoomLevel => set({ zoomLevel }),
    }),
    {
      name: "bear-storage",
    },
  ),
)
