import { Button, ButtonGroup, Dropdown, MenuItem, Tooltip } from "@curiousleaf/design"
import { IconMaximize, IconMinus, IconPlus } from "@tabler/icons-react"
import { useState } from "react"
import { useEditor } from "../providers/EditorProvider"

export const CanvasBottomNav = () => {
  const { editor } = useEditor()
  const [zoomLevel, setZoomLevel] = useState(1)
  const zoomLevels = [0.25, 0.5, 0.75, 1, 1.5, 2, 4]

  editor.on("zoomChange", setZoomLevel)

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-2">
      <Tooltip tooltip="Zoom to Fit">
        <Button
          size="sm"
          theme="secondary"
          variant="outline"
          prefix={<IconMaximize />}
          onClick={() => editor.zoomToFit()}
        />
      </Tooltip>

      <ButtonGroup>
        <Tooltip tooltip="Zoom In">
          <Button
            size="sm"
            theme="secondary"
            variant="outline"
            prefix={<IconPlus />}
            onClick={() => editor.zoomIn()}
          />
        </Tooltip>

        <Dropdown>
          <Dropdown.Trigger asChild>
            <Button size="sm" theme="secondary" variant="outline">
              <div className="min-w-[5ch]">{Math.round(zoomLevel * 100)}%</div>
            </Button>
          </Dropdown.Trigger>

          <Dropdown.Content>
            <Dropdown.Label className="text-2xs font-medium">Zoom Level</Dropdown.Label>

            <Dropdown.Group>
              {zoomLevels.map(level => (
                <Dropdown.Item key={level} onClick={() => editor.setZoom(level)}>
                  <MenuItem size="sm" className="text-center">
                    {level * 100}%
                  </MenuItem>
                </Dropdown.Item>
              ))}
            </Dropdown.Group>
          </Dropdown.Content>
        </Dropdown>

        <Tooltip tooltip="Zoom Out">
          <Button
            size="sm"
            theme="secondary"
            variant="outline"
            prefix={<IconMinus />}
            onClick={() => editor.zoomOut()}
          />
        </Tooltip>
      </ButtonGroup>
    </div>
  )
}
