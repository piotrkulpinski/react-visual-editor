import { Button, ButtonGroup, Tooltip, cx } from "@curiousleaf/design"
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCopy,
  IconDownload,
  IconHandStop,
  IconPointer,
  IconRuler,
  IconShape,
} from "@tabler/icons-react"
import type { HTMLAttributes } from "react"
import { type StoreApi, useStore } from "zustand"
import { useEditor } from "../providers/EditorProvider"
import { CanvasButton } from "./CanvasButton"

export const CanvasTopNav = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const { editor } = useEditor()

  if (!editor) {
    return null
  }
  const { isRulerEnabled } = useStore(editor?.store as StoreApi<any>)

  return (
    <div className={cx("size-full flex items-center", className)} {...props}>
      <div className="flex items-center divide-x -mx-3">
        <div className="flex items-center gap-0.5 px-3 h-4">
          <CanvasButton tooltip="Add Rectangle" prefix={<IconShape />} />
        </div>

        <div className="flex items-center gap-0.5 px-3 h-4">
          <CanvasButton tooltip="Undo" prefix={<IconArrowBackUp />} />
          <CanvasButton tooltip="Redo" prefix={<IconArrowForwardUp />} />
        </div>

        <div className="flex items-center gap-0.5 px-3 h-4">
          <CanvasButton tooltip="Select" prefix={<IconPointer />} />
          <CanvasButton tooltip="Pan" prefix={<IconHandStop />} />
        </div>

        <div className="flex items-center gap-0.5 px-3 h-4">
          <CanvasButton
            tooltip="Toggle Ruler"
            prefix={<IconRuler />}
            onClick={editor.rulerToggle}
            isActive={isRulerEnabled}
          />
        </div>
      </div>

      <ButtonGroup className="ml-auto">
        <Tooltip tooltip="Copy Image">
          <Button size="xs" theme="secondary" variant="outline">
            <IconCopy className="my-0.5" />
          </Button>
        </Tooltip>

        <Tooltip tooltip="Download Image">
          <Button size="xs" theme="secondary" variant="outline">
            <IconDownload className="my-0.5" />
          </Button>
        </Tooltip>
      </ButtonGroup>
    </div>
  )
}
