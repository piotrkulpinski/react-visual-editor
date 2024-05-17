import { useState } from "react"
import { Canvas } from "../lib/components/Canvas"
import type Handler from "../lib/handlers/Handler"
import { CanvasInteractionNav } from "./components/CanvasInteractionNav"
import { CanvasZoomNav } from "./components/CanvasZoomNav"
import { Nav } from "./components/Nav"
import { Sidebar } from "./components/Sidebar"
import { SidebarLeft } from "./components/SidebarLeft"
import { SidebarRight } from "./components/SidebarRight"

export default function App() {
  const [handler, setHandler] = useState<Handler | null>(null)

  return (
    <div className="flex flex-col h-dvh bg-gray-100">
      <Nav />

      <div className="flex h-[calc(100%-48px)] bg-radial bg-[length:15px_15px] bg-center">
        <Sidebar>
          <SidebarLeft />
        </Sidebar>

        <div className="relative flex flex-col flex-1 w-full overflow-clip">
          <nav className="relative z-10 h-10 shrink-0 px-4 bg-white shadow-outline">
            {/* <CanvasTopNav /> */}
          </nav>

          <Canvas
            ref={setHandler}
            className="h-[calc(100%-40px)]"
            options={{
              selectionBorderColor: "transparent",
              selectionColor: "rgb(178,204,255,0.5)",
            }}
          />

          {handler && <CanvasInteractionNav handler={handler} />}
          {handler && <CanvasZoomNav handler={handler} />}
        </div>

        <Sidebar>
          <SidebarRight />
        </Sidebar>
      </div>
    </div>
  )
}
