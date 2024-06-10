import { Button, ButtonGroup, Tooltip, cx } from "@curiousleaf/design"
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBraces,
  IconCopy,
  IconDownload,
  IconLetterT,
  IconLine,
  IconLock,
  IconLockOpen,
  IconRuler,
  IconShape,
} from "@tabler/icons-react"
import type { HTMLAttributes } from "react"
import { CanvasButton } from "./CanvasButton"
import { Handler } from "../../lib/handlers/Handler"
import { guideStore, historyStore, rulerStore } from "../../lib"
import { useStore } from "zustand"

type CanvasTopNavProps = HTMLAttributes<HTMLDivElement> & {
  handler: Handler
}

export const CanvasTopNav = ({ handler, className, ...props }: CanvasTopNavProps) => {
  const { canUndo, canRedo } = useStore(historyStore)
  const { isRulerEnabled } = useStore(rulerStore)
  const { isGuideEnabled } = useStore(guideStore)

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
          <CanvasButton
            tooltip="Toggle Ruler"
            prefix={<IconRuler />}
            isActive={isRulerEnabled}
            onClick={() => handler.rulerHandler.toggle()}
          />
          <CanvasButton
            tooltip="Toggle Guides"
            prefix={<IconLine />}
            isActive={isGuideEnabled}
            onClick={() => handler.guideHandler.toggle()}
          />
        </div>

        <div className="flex items-center gap-0.5 px-3 h-4">
          <CanvasButton
            tooltip="Lock Object"
            prefix={<IconLock />}
            // isActive={isRulerEnabled}
            onClick={() => handler.commandHandler.lock()}
          />
          <CanvasButton
            tooltip="Toggle Guides"
            prefix={<IconLockOpen />}
            // isActive={isGuideEnabled}
            onClick={() => handler.commandHandler.unlock()}
          />
        </div>
      </div>

      <ButtonGroup className="ml-auto">
        <Tooltip tooltip="Copy JSON">
          <Button
            size="xs"
            theme="secondary"
            variant="outline"
            onClick={() => handler.exportHandler.copyJSON()}
          >
            <IconBraces className="my-0.5" />
          </Button>
        </Tooltip>

        <Tooltip tooltip="Copy Image">
          <Button
            size="xs"
            theme="secondary"
            variant="outline"
            onClick={() => handler.exportHandler.copyImage()}
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
