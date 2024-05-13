import { cx } from "@curiousleaf/design"
import type { HTMLAttributes } from "react"

export const Canvas = ({ className, ...props }: HTMLAttributes<HTMLCanvasElement>) => {
  return <canvas id="canvas" className={cx("shadow-outline", className)} {...props} />
}
