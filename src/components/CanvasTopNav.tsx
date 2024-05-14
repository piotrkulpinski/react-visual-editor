import { Button, ButtonGroup, Tooltip } from "@curiousleaf/design"
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
import { CanvasButton } from "./CanvasButton"

export const CanvasTopNav = () => {
  return (
    <div className="flex items-center h-10 shrink-0 w-full px-4 bg-white border-b">
      <div className="flex items-center divide-x -mx-3">
        <div className="flex items-center gap-0.5 px-3 h-4">
          <CanvasButton
            tooltip="Add Rectangle"
            prefix={<IconShape />}
            // onClick={() => editor.addRectangle()}
          />
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
          <CanvasButton tooltip="Toggle Ruler" prefix={<IconRuler />} />
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
