import { ButtonGroup } from "@curiousleaf/design"
import { IconHandStop, IconPointer } from "@tabler/icons-react"
import type { HTMLAttributes } from "react"
import { useStore } from "zustand"
import type Handler from "../../lib/handlers/Handler"
import { InteractionMode } from "../../lib/utils/types"
import { CanvasButton } from "./CanvasButton"

type CanvasInteractionNavProps = HTMLAttributes<HTMLDivElement> & {
  handler: Handler
}

export const CanvasInteractionNav = ({ handler, ...props }: CanvasInteractionNavProps) => {
  const { interactionMode } = useStore(handler.store)

  return (
    <div className="absolute bottom-4 left-4 flex items-center gap-2" {...props}>
      <ButtonGroup>
        <CanvasButton
          tooltip="Select Mode"
          size="sm"
          theme="secondary"
          variant="outline"
          onClick={() => handler?.interactionHandler.setInteractionMode(InteractionMode.SELECT)}
          prefix={<IconPointer />}
          isActive={interactionMode === InteractionMode.SELECT}
        />

        <CanvasButton
          tooltip="Grab Mode"
          size="sm"
          theme="secondary"
          variant="outline"
          onClick={() => handler?.interactionHandler.setInteractionMode(InteractionMode.PAN)}
          prefix={<IconHandStop />}
          isActive={interactionMode === InteractionMode.PAN}
        />
      </ButtonGroup>
    </div>
  )
}
