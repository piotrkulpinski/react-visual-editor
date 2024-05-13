import { ScreenSize, Wrapper } from "@curiousleaf/design"
import { Editor } from "react-visual-editor"
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
        <Editor className="flex-1" />
        <CanvasBottomNav />
      </div>

      <SidebarRight />
      <ScreenSize />
    </Wrapper>
  )
}

export default App
