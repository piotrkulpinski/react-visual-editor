import { ScreenSize, Wrapper } from "@curiousleaf/design"
import { CanvasBottomNav } from "./components/CanvasBottomNav"
import { CanvasTopNav } from "./components/CanvasTopNav"
import { Nav } from "./components/Nav"
import { SidebarLeft } from "./components/SidebarLeft"
import { SidebarRight } from "./components/SidebarRight"

function App() {
  return (
    <Wrapper className="bg-gray-50 flex-wrap">
      <Nav />

      <SidebarLeft />

      <div className="sticky inset-y-0 h-screen flex flex-col flex-1 pt-12 bg-radial bg-[length:15px_15px] bg-center">
        <CanvasTopNav />

        <div id="workspace" className="flex-1">
          <canvas id="canvas" />
        </div>

        <CanvasBottomNav />
      </div>

      <SidebarRight />
      <ScreenSize />
    </Wrapper>
  )
}

export default App
