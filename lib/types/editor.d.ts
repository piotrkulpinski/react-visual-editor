declare type IPluginOptions = Record<string, unknown>

// 生命周期事件类型
declare type IEditorHooksType =
  | "hookImportBefore"
  | "hookImportAfter"
  | "hookSaveBefore"
  | "hookSaveAfter"

// 插件class
declare interface IPluginClass extends IPluginTempl {
  new (canvas: fabric.Canvas, editor: any, options: any)
}

declare interface IPluginMenu {
  text: string
  command?: () => void
  child?: IPluginMenu[]
}

// 插件实例
declare interface IPluginTempl {
  pluginName: string
  events: string[]
  apis: string[]
  canvas?: fabric.Canvas | null | undefined
  hotkeyEvent?: (name: string, e: KeyboardEvent) => void
  [propName: IEditorHooksType]: () => void
  [propName: string]: any
}
