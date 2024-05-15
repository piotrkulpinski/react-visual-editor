import { useEffect, useMemo, useRef } from "react"
import Editor, { RulerPlugin, WorkspacePlugin } from "../lib"
import { CanvasBottomNav } from "./components/CanvasBottomNav"
import { CanvasTopNav } from "./components/CanvasTopNav"
import { Nav } from "./components/Nav"
import { SidebarLeft } from "./components/SidebarLeft"
import { SidebarRight } from "./components/SidebarRight"
import { EditorProvider } from "./providers/EditorProvider"

function App() {
  const workspaceRef = useRef<HTMLDivElement>(null)
  const editor = useMemo(() => new Editor(), [])

  useEffect(() => {
    // Initialize the editor
    editor.init("canvas", {
      width: workspaceRef.current?.clientWidth ?? 0,
      height: workspaceRef.current?.clientHeight ?? 0,

      // Styling
      selectionBorderColor: "transparent",
      selectionColor: "rgb(178,204,255,0.5)",
    })

    // Plugins
    editor.use(WorkspacePlugin, {
      workspaceEl: workspaceRef.current,
      width: 1000,
      height: 1000,
      backgroundColor: "#B1B6A6",
    })

    editor.use(RulerPlugin)
    // editor.use(DragingPlugin)
    // editor.use(AlignGuidLinePlugin)
    // editor.use(ControlsPlugin)
    // editor.use(ControlsRotatePlugin)
    // editor.use(CenterAlignPlugin)
    // editor.use(LayerPlugin)
    // editor.use(CopyPlugin)
    // editor.use(MoveHotKeyPlugin)
    // editor.use(DeleteHotKeyPlugin)
    // editor.use(GroupPlugin)
    // editor.use(GroupTextEditorPlugin)
    // editor.use(GroupAlignPlugin)
    // editor.use(HistoryPlugin)
    // editor.use(FlipPlugin)

    return () => {
      editor.destroy()
    }
  }, [])

  return (
    <EditorProvider fabric={fabric} editor={editor}>
      <div className="flex flex-col h-dvh bg-gray-50">
        <Nav />

        <div className="flex h-[calc(100%-48px)] bg-radial bg-[length:15px_15px] bg-center">
          <SidebarLeft />

          <div className="relative flex flex-col flex-1 w-full overflow-clip">
            <CanvasTopNav />

            <div ref={workspaceRef} className="h-[calc(100%-40px)]">
              <canvas id="canvas" />
            </div>

            <CanvasBottomNav />
          </div>

          <SidebarRight />
        </div>
      </div>
    </EditorProvider>
  )
}

export default App
