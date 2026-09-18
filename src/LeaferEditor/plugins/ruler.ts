import { Ruler, buildDefaultConversionFactors } from "./ruler/index";
import type { Guide } from "./ruler/Guide";
import {
    App,
    Line,
} from "leafer-ui";

import type { IPlugin, IPluginHost } from "../core/interfaces";
import type { EditorRulerOptions } from "./interfaces";
import type { LeaferEditor } from "../core/editor";
import {
    RulerPluginServiceName,
    type IRulerPluginService,
} from "./interfaces";

export const RulerPluginName = "Ruler"

const GRID_LINE_STROKE_WIDTH = 0.8

export class RulerPlugin implements IPlugin<LeaferEditor, EditorRulerOptions>, IRulerPluginService {
    name: string = RulerPluginName

    private _ruler!: Ruler
    readonly unitList: string[] = ["px", "cm", "in", "pt", "pc", "mm"]
    private _currentUnit: string = ""
    private _defaultDPI: number = 72

    private strokeWidth = GRID_LINE_STROKE_WIDTH
    private options: EditorRulerOptions = {}

    private _pageLinesMap: Map<string, Line[]> = new Map()
    _editor: LeaferEditor | null = null
    public get editor(): LeaferEditor {
        if (!this._editor) throw new Error("Plugin not installed")
        return this._editor as LeaferEditor
    }
    private get app(): App {
        return this.editor.app
    }
    private get guide(): Guide {
        return this._ruler.guide
    }

    get currentUnit(): string {
        return this._currentUnit || this.unitList[0] as string
    }

    changeUnit(unit: string): void {
        if (!this._ruler?.enabled) return
        if (!this.unitList.includes(unit)) {
            console.warn(`The unit ${unit} is not supported`)
            return
        }
        if (this._currentUnit === unit) return
        this._currentUnit = unit
        this._ruler.changeUnit(unit)
    }

    isEnabled(): boolean {
        return this._ruler?.enabled ?? false
    }

    setEnabled(enabled: boolean): void {
        this._ruler?.changeEnabled(enabled)
    }

    toggleEnabled(): void {
        if (this._ruler) {
            this.setEnabled(!this.isEnabled())
        }
    }

    public get gridLines(): Line[] {
        return this.guide.guideLines
    }

    public newGridLine(place: number, direction: 'h' | 'v'): Line {
        const guideDirection = direction === 'h' ? 'horizontal' : 'vertical'
        return this.guide.newGridLine(place, guideDirection)
    }

    public addGridLine(line: Line) {
        if (!line) return
        const lineId = line.id || ""
        if (lineId && this.gridLines.filter(l => l.id === lineId).length > 0) return
        if (line.className !== this.guide.gridLineName) return
        if (line.parent) {
            line.parent.remove(line)
        }
        this.guide.add(line)
    }

    public removeGridLine(line: Line | string) {
        if (typeof line === 'string') {
            line = this.gridLines.filter(l => l.id === line)[0] as Line
        } else {
            if (!line) return
            const index = this.gridLines.indexOf(line)
            if (index === -1) return
        }
        if (!line) return
        if (line.className !== this.guide.gridLineName) return
        this.guide.removeGuideLine(line)
    }

    public clearGridLines() {
        this.guide.clearAllGuideLines()
    }

    public gridLinesShow() {
        this.guide.show()
    }

    public gridLinesHide() {
        this.guide.hide()
    }

    public gridLinesIsShow(): boolean {
        if (this.gridLines.length === 0) return true
        let isShow = false
        this.gridLines.forEach(line => {
            if (line.visible) isShow = true
        })
        return isShow
    }

    install(host: IPluginHost<LeaferEditor>, options: EditorRulerOptions = {}) {
        this._editor = host.getInstance()
        this.options = { ...options }
        this._defaultDPI = this.options.dpi || 72

        this._ruler = new Ruler(this.app, {
            enabled: true,
            theme: "light",
            guide: {
                enabled: true,
                guideLineColor: this.options.gridLine?.strokeColor || '#1d1dff',
                guideLineWidth: this.strokeWidth,
                guideLineActiveColor: this.options.gridLine?.strokeDragColor || '#ff0000',
                hitRadius: 5,
            },
            conversionFactors: buildDefaultConversionFactors(this._defaultDPI),
        })

        if (this.options.enabled !== undefined) {
            this._ruler.changeEnabled(this.options.enabled)
        }
        if (this.options.unit) {
            this.changeUnit(this.options.unit)
        }

        this.bindPageEvents()

        host.registerService({
            name: RulerPluginServiceName,
            service: this,
            description: "Ruler 插件 Service（标尺管理 + 网格线创建）",
            plugin: this,
        })
    }

    private boundOnPageChangeBefore = this.onPageChangeBefore.bind(this)
    private boundOnPageChangeAfter = this.onPageChangeAfter.bind(this)

    private bindPageEvents() {
        this.editor.eventBus.on(this.editor.Events.pageChangeBefore, this.boundOnPageChangeBefore)
        this.editor.eventBus.on(this.editor.Events.pageChangeAfter, this.boundOnPageChangeAfter)
    }

    private onPageChangeBefore({ oldId }: { oldId: string, newId: string }) {
        // this.guide.storePageLines(oldId)
        const guideLines = this.guide.guideLines
        this._pageLinesMap.set(oldId, [...guideLines])
        this.guide.clearAllGuideLines()
    }

    private onPageChangeAfter({ newId }: { oldId: string, newId: string }) {
        const guideLines = this._pageLinesMap.get(newId) || []
        this.guide.guideLines = guideLines
    }

    public destroy() {
        this.editor.eventBus.off(this.editor.Events.pageChangeBefore, this.boundOnPageChangeBefore)
        this.editor.eventBus.off(this.editor.Events.pageChangeAfter, this.boundOnPageChangeAfter)

        this._pageLinesMap.clear()

        if (this._ruler) {
            this._ruler.changeEnabled(false)
            this._ruler.dispose()
        }
    }

    public uninstall(host: IPluginHost<LeaferEditor>) {
        host.unregisterService(RulerPluginServiceName)
        this.destroy()
    }
}
