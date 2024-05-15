import { cx } from "@curiousleaf/design"
import type { HTMLAttributes } from "react"

export const Sidebar = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cx(
        "relative z-20 w-64 shrink-0 bg-white shadow-outline divide-y overflow-y-auto overscroll-contain",
        className,
      )}
      {...props}
    />
  )
}
