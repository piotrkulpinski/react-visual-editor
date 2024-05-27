/** eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react"
import { Canvas } from "../lib/components/Canvas"
import type Handler from "../lib/handlers/Handler"
import { CanvasZoomNav } from "./components/CanvasZoomNav"
import { CanvasInteractionNav } from "./components/CanvasInteractionNav"

export default function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [handler, setHandler] = useState<Handler | null>(null)

  return (
    <div className="flex flex-col h-dvh bg-gray-100 bg-radial bg-[length:15px_15px] bg-center">
      {/* <Nav /> */}

      {/* <div className="flex h-[calc(100%-48px)] bg-radial bg-[length:15px_15px] bg-center">
        <Sidebar>{handler && <SidebarLeft handler={handler} />}</Sidebar> */}

      <div className="relative flex flex-col flex-1 w-full overflow-clip">
        <nav className="relative z-10 h-10 shrink-0 px-4 bg-white shadow-outline">
          {/* <CanvasTopNav /> */}
        </nav>

        <Canvas
          ref={setHandler}
          className="h-full"
          options={{
            selectionBorderColor: "transparent",
            selectionColor: "rgb(178,204,255,0.5)",
          }}
        />

        {handler && <CanvasInteractionNav handler={handler} />}
        {handler && <CanvasZoomNav handler={handler} />}
      </div>

      {/* <Sidebar>
          <SidebarRight />
        </Sidebar>
      </div> */}
    </div>
  )
}
