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
        className={cx(isActive && "!border-gray-300 bg-gray-50 shadow-inner", className)}
        {...rest}
      />
    </Tooltip>
  )
})
