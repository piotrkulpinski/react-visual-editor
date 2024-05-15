import { cx } from "@curiousleaf/design"
import type { HTMLAttributes } from "react"

export const Nav = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cx(
        "flex items-center gap-3 shrink-0 h-12 w-full border-b bg-white px-4 md:gap-4",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2.5 mx-auto text-xs/none">
        <strong className="max-w-60 font-medium truncate">React Visual Editor</strong>
      </div>
    </div>
  )
}
