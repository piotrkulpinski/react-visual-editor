import Editor from "./Editor"
import EventType from "./eventType"
import Utils from "./utils/utils"

// export { default as DragingPlugin } from "./plugin/DragingPlugin"
// export { default as AlignGuidLinePlugin } from "./plugin/AlignGuidLinePlugin"
// export { default as ControlsPlugin } from "./plugin/ControlsPlugin"
// export { default as ControlsRotatePlugin } from "./plugin/ControlsRotatePlugin"
// export { default as CenterAlignPlugin } from "./plugin/CenterAlignPlugin"
// export { default as LayerPlugin } from "./plugin/LayerPlugin"
// export { default as CopyPlugin } from "./plugin/CopyPlugin"
// export { default as MoveHotKeyPlugin } from "./plugin/MoveHotKeyPlugin"
// export { default as DeleteHotKeyPlugin } from "./plugin/DeleteHotKeyPlugin"
// export { default as GroupPlugin } from "./plugin/GroupPlugin"
// export { default as GroupTextEditorPlugin } from "./plugin/GroupTextEditorPlugin"
// export { default as GroupAlignPlugin } from "./plugin/GroupAlignPlugin"
export { default as WorkspacePlugin } from "./plugin/WorkspacePlugin"
// export { default as HistoryPlugin } from "./plugin/HistoryPlugin"
// export { default as FlipPlugin } from "./plugin/FlipPlugin"
export { default as RulerPlugin } from "./plugin/RulerPlugin"
// export { default as FontPlugin } from "./plugin/FontPlugin"

export { EventType, Utils }
export default Editor
