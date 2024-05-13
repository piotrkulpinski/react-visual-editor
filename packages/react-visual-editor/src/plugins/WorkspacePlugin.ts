import { registerPlugin } from "../utils/plugin"

const WorkspacePlugin = registerPlugin({
  name: "WorkspacePlugin",

  init: canvas => {
    console.log("init", canvas)
  },

  actions: {
    zoomIn: () => {
      const { left, top } = canvas.getCenter()
      let zoomRatio = canvas.getZoom()
      zoomRatio += 0.05

      canvas.zoomToPoint(new fabric.Point(left, top), zoomRatio)
    },
  },
})

export default WorkspacePlugin
