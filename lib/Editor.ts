import EventEmitter from "events"
import type { ICanvasOptions } from "fabric/fabric-impl"
import hotkeys from "hotkeys-js"
import { AsyncSeriesHook } from "tapable"
import ServersPlugin from "./plugin/ServersPlugin"

class Editor extends EventEmitter {
  public canvas: fabric.Canvas | null = null;
  [key: string]: any
  private pluginMap: {
    [propName: string]: IPluginTempl
  } = {}

  // Custom Events
  private customEvents: string[] = []

  // Custom API
  private customApis: string[] = []

  // Lifecycle function names
  private hooks: IEditorHooksType[] = [
    "hookImportBefore",
    "hookImportAfter",
    "hookSaveBefore",
    "hookSaveAfter",
  ]

  // Default canvas options
  private canvasOptions: ICanvasOptions = {
    fireRightClick: true,
    stopContextMenu: true,
    controlsAboveOverlay: true,
    imageSmoothingEnabled: false,
    preserveObjectStacking: true,
  }

  public hooksEntity: {
    [propName: string]: AsyncSeriesHook<any, any>
  } = {}

  init(element: HTMLCanvasElement | string | null, options?: ICanvasOptions) {
    this.canvas = new fabric.Canvas(element, Object.assign({}, options, this.canvasOptions))

    this._initActionHooks()
    this._initServersPlugin()
  }

  // Import component
  use(plugin: IPluginClass, options?: IPluginOption) {
    if (this._checkPlugin(plugin) && this.canvas) {
      this._saveCustomAttr(plugin)
      const pluginRunTime = new plugin(this.canvas, this, options || {}) as IPluginClass
      this.pluginMap[plugin.pluginName] = pluginRunTime
      this._bindingHooks(pluginRunTime)
      this._bindingHotkeys(pluginRunTime)
      this._bindingApis(pluginRunTime)
    }
  }

  destroy() {
    this.canvas?.dispose()
    this.canvas = null
    this.pluginMap = {}
    this.customEvents = []
    this.customApis = []
    this.hooksEntity = {}
  }

  // Get plugins
  getPlugin(name: string) {
    if (this.pluginMap[name]) {
      return this.pluginMap[name]
    }
  }

  // Check component
  private _checkPlugin(plugin: IPluginClass) {
    const { pluginName, events = [], apis = [] } = plugin

    // Name check
    if (this.pluginMap[pluginName]) {
      throw new Error(`${pluginName} plugin is already initialized`)
    }

    for (const eventName of events) {
      if (this.customEvents.includes(eventName)) {
        throw new Error(`${pluginName} plugin has duplicate event: ${eventName}`)
      }
    }

    for (const apiName of apis) {
      if (this.customApis.includes(apiName)) {
        throw new Error(`${pluginName} plugin has duplicate API: ${apiName}`)
      }
    }

    return true
  }

  // Bind hooks method
  private _bindingHooks(plugin: IPluginClass) {
    for (const hookName of this.hooks) {
      const hook = plugin[hookName] as any
      if (hook) {
        this.hooksEntity[hookName]?.tapPromise(plugin.pluginName + hookName, (...args: any[]) => {
          return hook.apply(plugin, args)
        })
      }
    }
  }

  // Bind shortcut keys
  private _bindingHotkeys(plugin: IPluginClass) {
    if (plugin?.hotkeys) {
      for (const keyName of plugin.hotkeys) {
        // Support keyup
        hotkeys(keyName, { keyup: true }, e => {
          plugin.hotkeyEvent?.(keyName, e)
        })
      }
    }
  }

  // Save component custom events and APIs
  private _saveCustomAttr(plugin: any) {
    const { events = [], apis = [] } = plugin
    this.customApis = this.customApis.concat(apis)
    this.customEvents = this.customEvents.concat(events)
  }

  // Proxy API events
  private _bindingApis(pluginRunTime: any) {
    const { apis = [] } = pluginRunTime.constructor || {}
    for (const apiName of apis) {
      this[apiName] = (...args: any[]) => {
        return pluginRunTime[apiName].apply(pluginRunTime, args)
      }
    }
  }

  _initActionHooks() {
    for (const hookName of this.hooks) {
      this.hooksEntity[hookName] = new AsyncSeriesHook(["data"])
    }
  }

  _initServersPlugin() {
    this.use(ServersPlugin)
  }

  // Fixes the error of unmounting when the listener is undefined
  off(eventName: string, listener: any): this {
    // noinspection TypeScriptValidateTypes
    return listener ? super.off(eventName, listener) : this
  }
}

export default Editor
