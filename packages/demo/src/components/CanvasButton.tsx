import { Button, Tooltip, cx } from "@curiousleaf/design"
import { type ComponentProps, type ElementRef, forwardRef } from "react"

type CanvasButtonElement = ElementRef<typeof Button>

type CanvasButtonProps = ComponentProps<typeof Button> & {
  tooltip?: string
  isActive?: boolean
}

export const CanvasButton = forwardRef<CanvasButtonElement, CanvasButtonProps>((props, ref) => {
  const {
    className,
    tooltip,
    size = "xs",
    theme = "secondary",
    variant = "ghost",
    isActive,
    ...rest
  } = props

  return (
    <Tooltip tooltip={tooltip}>
      <Button
        ref={ref}
        size={size}
        theme={theme}
        variant={variant}
        className={cx(
          isActive &&
            "-translate-y-px bg-gray-100 after:absolute after:top-full after:left-1/2 after:size-0.5 after:bg-primary after:rounded-full after:-translate-x-1/2",
          className,
        )}
        {...rest}
      />
    </Tooltip>
  )
})
