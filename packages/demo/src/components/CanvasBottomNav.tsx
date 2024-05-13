import { Button, ButtonGroup, Dropdown, MenuItem, Tooltip } from "@curiousleaf/design"
import { IconMaximize, IconMinus, IconPlus } from "@tabler/icons-react"

export const CanvasBottomNav = () => {
  const zoomLevels = [0.25, 0.5, 0.75, 1, 1.5, 2]

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-2">
      <Tooltip tooltip="Zoom to Fit">
        <Button size="sm" theme="secondary" variant="outline" prefix={<IconMaximize />} />
      </Tooltip>

      <ButtonGroup>
        <Tooltip tooltip="Zoom In">
          <Button size="sm" theme="secondary" variant="outline" prefix={<IconPlus />} />
        </Tooltip>

        <Dropdown>
          <Dropdown.Trigger asChild>
            <Button size="sm" theme="secondary" variant="outline">
              66%
            </Button>
          </Dropdown.Trigger>

          <Dropdown.Content>
            <Dropdown.Label className="text-2xs font-medium">Zoom Level</Dropdown.Label>
            <Dropdown.Group>
              {zoomLevels.map(level => (
                <Dropdown.Item key={level}>
                  <MenuItem size="sm" className="text-center">
                    {level * 100}%
                  </MenuItem>
                </Dropdown.Item>
              ))}
            </Dropdown.Group>
          </Dropdown.Content>
        </Dropdown>

        <Tooltip tooltip="Zoom Out">
          <Button size="sm" theme="secondary" variant="outline" prefix={<IconMinus />} />
        </Tooltip>
      </ButtonGroup>
    </div>
  )
}
