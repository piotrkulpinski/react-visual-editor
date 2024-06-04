import { HTMLAttributes } from "react"
import { Handler } from "../../lib/handlers/Handler"
import { Button } from "@curiousleaf/design"

type SidebarLeftProps = HTMLAttributes<HTMLDivElement> & {
  handler: Handler
}

export const SidebarLeft = ({ handler, ...props }: SidebarLeftProps) => {
  return (
    <div className="p-4 text-sm/none" {...props}>
      Left Sidebar
      <Button onClick={() => handler.objectHandler.addRect()}>Add Rectangle</Button>
      <Button onClick={() => handler.objectHandler.addText("Everything is fine")}>Add Text</Button>
    </div>
  )
}
