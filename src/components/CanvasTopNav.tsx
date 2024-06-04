import { Button, ButtonGroup, Tooltip, cx } from "@curiousleaf/design"
import {
    IconArrowBackUp,
    IconArrowForwardUp,
    IconCopy,
    IconDownload,
    IconLetterT,
    IconLine,
    IconRuler,
    IconShape,
} from "@tabler/icons-react"
import type { HTMLAttributes } from "react"
import { CanvasButton } from "./CanvasButton"
import { Handler } from "../../lib/handlers/Handler"
import { historyStore } from "../../lib"
import { useStore } from "zustand"

type CanvasTopNavProps = HTMLAttributes<HTMLDivElement> & {
  handler: Handler
}

export const CanvasTopNav = ({ handler, className, ...props }: CanvasTopNavProps) => {
  const { canUndo, canRedo } = useStore(historyStore)

  return (
    <div className={cx("size-full flex items-center", className)} {...props}>
      <div className="flex items-center divide-x -mx-3">
        <div className="flex items-center gap-0.5 px-3 h-4">
          <CanvasButton
            tooltip="Add Rectangle"
            prefix={<IconShape />}
            onClick={() => handler.objectHandler.addRect()}
          />
          <CanvasButton
            tooltip="Add Text"
            prefix={<IconLetterT />}
            onClick={() => handler.objectHandler.addText("Everything is fine")}
          />
        </div>

        <div className="flex items-center gap-0.5 px-3 h-4">
          <CanvasButton
            tooltip="Undo"
            prefix={<IconArrowBackUp />}
            disabled={!canUndo}
            onClick={() => handler.historyHandler.undo()}
          />
          <CanvasButton
            tooltip="Redo"
            prefix={<IconArrowForwardUp />}
            disabled={!canRedo}
            onClick={() => handler.historyHandler.redo()}
          />
        </div>

        <div className="flex items-center gap-0.5 px-3 h-4">
          <CanvasButton tooltip="Toggle Ruler" prefix={<IconRuler />} />
          <CanvasButton tooltip="Toggle Guides" prefix={<IconLine />} />
        </div>
      </div>

      <ButtonGroup className="ml-auto">
        <Tooltip tooltip="Copy Image">
          <Button
            size="xs"
            theme="secondary"
            variant="outline"
            onClick={() => handler.exportHandler.exportToClipboard()}
          >
            <IconCopy className="my-0.5" />
          </Button>
        </Tooltip>

        <Tooltip tooltip="Download Image">
          <Button
            size="xs"
            theme="secondary"
            variant="outline"
            onClick={() => handler.exportHandler.exportImage("png", 1)}
          >
            <IconDownload className="my-0.5" />
          </Button>
        </Tooltip>
      </ButtonGroup>
    </div>
  )
}
