import { ScreenSize, Wrapper } from "@curiousleaf/design"
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
    const canvas = new fabric.Canvas("canvas", {
      width: workspaceRef.current?.clientWidth ?? 0,
      height: workspaceRef.current?.clientHeight ?? 0,

      // Options
      fireRightClick: true,
      stopContextMenu: true,
      controlsAboveOverlay: true,
      imageSmoothingEnabled: false,
      preserveObjectStacking: true,

      // Styling
      selectionBorderColor: "transparent",
      selectionColor: "rgb(178,204,255,0.5)",
    })

    // Initialize the editor
    editor.init(canvas)

    // Plugins
    editor.use(WorkspacePlugin, {
      workspaceEl: workspaceRef.current,
      width: 1000,
      height: 1000,
      backgroundColor: "#fff",
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
      <Wrapper className="bg-gray-50 flex-wrap">
        <Nav />

        <SidebarLeft />

        <div className="sticky inset-y-0 h-dvh flex-1 pt-12 bg-radial bg-[length:15px_15px] bg-center">
          <CanvasTopNav />
          <div ref={workspaceRef} className="w-full h-[calc(100%-40px+1px)]">
            <canvas id="canvas" />
          </div>
          <CanvasBottomNav />
        </div>

        <SidebarRight />
        <ScreenSize />
      </Wrapper>
    </EditorProvider>
  )
}

export default App
