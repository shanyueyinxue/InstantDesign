import type { IUI } from "leafer-ui";
import { Snap as BaseSnap } from 'leafer-x-easy-snap'

import type { LeaferEditor } from "../core/editor";
import type { IPlugin, IPluginHost } from "../core/interfaces";
import type { ISnapPluginService, IRulerPluginService } from "./interfaces";
import { SnapPluginServiceName } from "./interfaces";

import { RulerPluginName } from "./ruler";

class Snap extends BaseSnap {
    private _extendElementFunc: () => IUI[] = () => []
    extendElement(func: () => IUI[]) {
        this._extendElementFunc = func
    }
    collectSnapElements() {
        const list = super.collectSnapElements()
        return [...this._extendElementFunc(), ...list]
    }
}

export class SnapPlugin implements IPlugin, ISnapPluginService {
    name = "snap";

    private _editor: LeaferEditor | null = null
    private get editor(): LeaferEditor {
        if (!this._editor) throw new Error("SnapPlugin not installed")
        return this._editor
    }

    private boundOnPageChangeAfter = () => {
        this.updateConfig()
    }

    private snap: Snap | null = null

    install(host: IPluginHost<LeaferEditor>, options?: any) {
        this._editor = host.getInstance()
        this.snap = new Snap(this.editor.app, {
            parentContainer: this.editor.page.current.contentFrame,
        })
        this.snap.extendElement(() => {
            const ruler = this.editor.getService<IRulerPluginService>(RulerPluginName)
            if (!ruler) return []
            return ruler.gridLines.filter(line => line.visible) || []
        })

        // 启用
        this.enable()

        this.editor.eventBus.on(this.editor.Events.pageChangeAfter, this.boundOnPageChangeAfter)
        host.registerServiceFor(this, SnapPluginServiceName, this)
    }

    private _isEnabled = false
    enable() {
        if (this.snap) this.snap.enable(true)
        this._isEnabled = true
    }
    disable() {
        if (this.snap) this.snap.enable(false)
        this._isEnabled = false
    }

    get isEnabled() {
        return this._isEnabled
    }

    private updateConfig() {
        if (this.snap) {
            this.snap.updateConfig({
                parentContainer: this.editor.page.current.contentFrame,
            })
        }
    }

    distroy() {
        if (this.snap) this.snap.destroy()

        this.editor.eventBus.off(this.editor.Events.pageChangeAfter, this.boundOnPageChangeAfter)
        this._editor = null
        this.snap = null
    }
    
    uninstall(_: IPluginHost<LeaferEditor>) {
        this.distroy()
    }
}