import type Editor from "./Editor"

export type ContextMenuItem = null | {
  text: string
  hotkey?: string
  disabled?: boolean
  onclick?: () => void
  subitems?: ContextMenuItem[]
}

class EditorPlugin<T = IPluginOptions> implements IPluginTempl {
  public canvas: fabric.Canvas
  public editor: Editor
  public options: T
  public pluginName = "textPlugin"
  public events = ["textEvent1", "textEvent2"]
  public apis = ["textAPI1", "textAPI2"]
  public hotkeys: string[] = ["ctrl+v", "ctrl+a"]

  constructor(canvas: fabric.Canvas, editor: Editor, options: T = {} as T) {
    this.canvas = canvas
    this.editor = editor
    this.options = options
  }

  destroy() {
    console.log("pluginDestroy")
  }

  // Before saving
  hookSaveBefore() {
    console.log("pluginHookSaveBefore")
  }

  // Before saving
  hookSaveAfter() {
    console.log("pluginHookSaveAfter")
  }

  // Shortcut extension callback
  hotkeyEvent(eventName: string, e?: KeyboardEvent) {
    console.log("pluginHotkeyEvent", eventName, e)
  }

  // Right-click menu extension
  contextMenu(): ContextMenuItem[] | undefined {
    return [
      { text: "Back", hotkey: "Alt+Left arrow", disabled: true },
      { text: "Forward", hotkey: "Alt+Right arrow", disabled: true },
      { text: "Reload", hotkey: "Ctrl+R" },
      null,
      { text: "Save as...", hotkey: "Ctrl+S" },
      { text: "Print...", hotkey: "Ctrl+P" },
      { text: "Cast..." },
      { text: "Translate to English" },
      null,
      { text: "View page source", hotkey: "Ctrl+U" },
      { text: "Inspect", hotkey: "Ctrl+Shift+I" },
      null,
      {
        text: "Kali tools",
        hotkey: "❯",
        subitems: [
          {
            text: "Fuzzing Tools",
            hotkey: "❯",
            subitems: [
              { text: "spike-generic_chunked" },
              { text: "spike-generic_listen_tcp" },
              { text: "spike-generic_send_tcp" },
              { text: "spike-generic_send_udp" },
            ],
          },
          {
            text: "VoIP Tools",
            hotkey: "❯",
            subitems: [{ text: "voiphopper" }],
          },
          { text: "nikto" },
          { text: "nmap" },
          { text: "sparta" },
          { text: "unix-privesc-check" },
        ],
      },
      { text: "Skins", hotkey: "❯" },
    ]
  }

  _command() {
    console.log("pluginContextMenuCommand")
  }
}

export default EditorPlugin
