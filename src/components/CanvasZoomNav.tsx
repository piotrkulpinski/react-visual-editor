import { Button, ButtonGroup, Dropdown, MenuItem, Tooltip } from "@curiousleaf/design"
import { IconMaximize, IconMinus, IconPlus, IconSelectAll } from "@tabler/icons-react"
import type { HTMLAttributes } from "react"
import { useStore } from "zustand"
import type Handler from "../../lib/handlers/Handler"

type CanvasZoomNavProps = HTMLAttributes<HTMLDivElement> & {
  handler: Handler
}

export const CanvasZoomNav = ({ handler, ...props }: CanvasZoomNavProps) => {
  const { zoom } = useStore(handler.store)
  const zoomLevels = [0.25, 0.5, 0.75, 1, 1.5, 2, 4]

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-2" {...props}>
      <ButtonGroup>
        <Tooltip tooltip="Zoom to fit">
          <Button
            size="sm"
            theme="secondary"
            variant="outline"
            prefix={<IconMaximize />}
            onClick={() => handler.zoomHandler.setZoomToFit()}
          />
        </Tooltip>
        <Tooltip tooltip="Zoom to selection">
          <Button
            size="sm"
            theme="secondary"
            variant="outline"
            prefix={<IconSelectAll />}
            onClick={() => handler.zoomHandler.setZoomToSelection()}
          />
        </Tooltip>
      </ButtonGroup>

      <ButtonGroup>
        <Tooltip tooltip="Zoom in">
          <Button
            size="sm"
            theme="secondary"
            variant="outline"
            prefix={<IconPlus />}
            onClick={() => handler.zoomHandler.setZoomIn()}
          />
        </Tooltip>

        <Dropdown>
          <Dropdown.Trigger asChild>
            <Button size="sm" theme="secondary" variant="outline">
              <div className="min-w-[5ch]">{Math.round(zoom * 100)}%</div>
            </Button>
          </Dropdown.Trigger>

          <Dropdown.Content>
            <Dropdown.Label className="text-2xs font-medium">Zoom Level</Dropdown.Label>

            <Dropdown.Group>
              {zoomLevels.map((level) => (
                <Dropdown.Item key={level} onClick={() => handler.zoomHandler.setZoom(level)}>
                  <MenuItem size="sm" className="text-center">
                    {level * 100}%
                  </MenuItem>
                </Dropdown.Item>
              ))}
            </Dropdown.Group>
          </Dropdown.Content>
        </Dropdown>

        <Tooltip tooltip="Zoom out">
          <Button
            size="sm"
            theme="secondary"
            variant="outline"
            prefix={<IconMinus />}
            onClick={() => handler.zoomHandler.setZoomOut()}
          />
        </Tooltip>
      </ButtonGroup>
    </div>
  )
}
