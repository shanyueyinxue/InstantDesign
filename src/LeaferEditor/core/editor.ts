import type {
    IExportFileType,
    IExportOptions,
    IFindCondition,
    IFindUIMethod,
    IUI,
    IZoomType
} from "@leafer-ui/interface";
import { PointerEvent, Group, ZoomEvent, PropertyEvent } from 'leafer-ui'
import {
    App,
    Frame,
    ResizeEvent,
    DragEvent,
    UI
} from "leafer-ui";

import '@leafer-in/editor'
import '@leafer-in/viewport'
import "@leafer-in/view"
import "@leafer-in/export"

import '@leafer-in/text-editor'
import '@leafer-in/find'
import '@leafer-in/arrow'

import '@leafer-in/state' // 导入交互状态插件
import '@leafer-in/animate' // 导入动画插件  

import { Canvas } from './canvas'
import { MittBus, EventTypes } from "./events";
import { Tag, ImageSourceTag, type ILeaferEditor, type LeaferEditorOptions } from './interfaces'
import { EditorEvent } from "@leafer-in/editor";
import { PluginHost } from "./pluginHost";

import { findLowestCommonAncestor } from "./utils/find";
import "./shapes"
import { generateID, deepMerge } from "./utils";
import { readFileAsDataURL } from "./utils/file";
import { debounce } from "./utils/debounce";

const UNGROUP_ZINDEX_FRACTION = 0.01

import {
    PageManager,
    HistoryManager,
    LayerManager,
    ModeManager,
    ImageManager,
    ClipboardManager,
    FontManager,
} from "./managers";
import deepClone from "./utils/deepClone";

export class LeaferEditor extends PluginHost implements ILeaferEditor {
    private _defaultOptions: LeaferEditorOptions = {
        canvas: {
            width: 600,
            height: 600,
            fill: "#FFF",
            disabledMove: false,
            disabledWheel: false,
            zoomMode: false,
            lockRatio: false,
            hideOnMove: false,
        },
        page: {
            changePageZoomFit: true,
        },
        history: {
            enabled: true,
            maxSize: 20,
        },
        image: {
            fileTypes: [],
            maxSize: 1024 * 1024 * 10,
            uploadCallback: async (file: File, _sourceTag: ImageSourceTag, _image?: IUI) => {
                return readFileAsDataURL(file)
            },
        },
    }
    private _width: number
    private _height: number

    private _app: App
    private _currentScale: number = 1

    public view: HTMLElement
    public readonly options: LeaferEditorOptions
    public eventBus: MittBus = new MittBus()
    public Events = EventTypes

    public readonly page: PageManager
    public readonly history: HistoryManager
    public readonly layer: LayerManager
    public readonly mode: ModeManager
    public readonly image: ImageManager
    public readonly clipboard: ClipboardManager
    public readonly font: FontManager
    constructor(options?: LeaferEditorOptions) {
        super()
        this.options = deepMerge(this._defaultOptions, options || {})

        this._width = this.options.canvas?.width || 600
        this._height = this.options.canvas?.height || 600

        const el = document.createElement('div')
        el.style.width = `${this._width}px`
        el.style.height = `${this._height}px`
        const app = new App({
            view: el,
            width: el.offsetWidth,
            height: el.offsetHeight,

            fill: this.options.canvas?.fill || "#FFF",
            move: {
                disabled: this.options.canvas?.disabledMove || false,
            },
            wheel: {
                disabled: this.options.canvas?.disabledWheel || false,
                zoomSpeed: 0.05,
                moveSpeed: 0.15,
                zoomMode: this.options.canvas?.zoomMode || false,
            },
            editor: {
                hideOnMove: this.options.canvas?.hideOnMove || false,
                point: { cornerRadius: 0 },
                middlePoint: {},
                rotatePoint: { width: 16, height: 16 },
                buttonsDirection: 'top',
                rotateAround: "center",
                lockRatio: this.options.canvas?.lockRatio || false,
                circle: { pointType: 'move', cursor: 'move', width: 16, height: 16, }
            },
        })
        this._app = app

        this.view = app.canvas.view
        // 让 view 可聚焦：实例级快捷键(Mousetrap 绑定到 view)依赖焦点在本 view 内，
        // 多个编辑器同页时以 DOM 焦点决定快捷键作用于哪个实例。
        this.view.tabIndex = this.view.tabIndex >= 0 ? this.view.tabIndex : 0
        this.view.style.outline = 'none'
        this.app.tree.zoom('fit')

        this.page = new PageManager(this)
        this.history = new HistoryManager(this, {
            enabled: this.options.history?.enabled ?? true,
            maxSize: this.options.history?.maxSize ?? 20,
        })
        this.layer = new LayerManager(this)
        this.mode = new ModeManager(this)
        this.image = new ImageManager(this)
        this.clipboard = new ClipboardManager(this)
        this.font = new FontManager(this)

        this.registerEvents()

        this.page.initDefault()
        // this.app.start()
        // this.page.setCurrent(this.page.currentID)
        this.currentScale = 1
        this.zoom('fit')
    }

    get canvasWidth(): number { return this._width }
    get canvasHeight(): number { return this._height }

    public zoom(type: IZoomType) {
        const boundsData = this.app.tree.zoom(type)
        const { width, height } = this.app.tree.boxBounds
        const { width: canvasWidth, height: canvasHeight } = boundsData

        const scaleX = canvasWidth / width
        const scaleY = canvasHeight / height
        this._currentScale = Math.min(scaleX, scaleY)
        this.eventBus.emit(EventTypes.canvasZoomChange, this._currentScale)
    }

    public get currentScale(): number {
        return this._currentScale
    }
    public set currentScale(value: number) {
        this._currentScale = value
        this.app.tree.zoom(value)
        this.eventBus.emit(EventTypes.canvasZoomChange, this._currentScale)
    }

    public clear() {
        this.page.current.groundFrame.removeAll()
        this.page.current.contentFrame.removeAll()
        this.page.current.skyFrame.removeAll()
        this.history.save()
    }
    public clearContent() {
        this.page.current.contentFrame.removeAll()
        this.history.save()
    }
    public clearGround() {
        this.page.current.groundFrame.removeAll()
        this.history.save()
    }
    public clearSky() {
        this.page.current.skyFrame.removeAll()
        this.history.save()
    }

    public resize(width: number, height: number, _syncCanvasSize?: boolean) {
        if (_syncCanvasSize) {
            this.canvasResize(width, height)
        }
        this.app.resize({ width, height })
        this.zoom('fit')
    }
    public select(target: IUI | IUI[]) {
        this.app.editor.select(target)
    }
    public cancel() {
        this.app.editor.cancel()
        this.app.editor.hoverTarget = undefined
    }
    public toJSON(): object {
        const pages: any = {}
        for (const canvas of this.page.list()) {
            pages[canvas.name] = canvas.toJSON()
        }
        return {
            width: this._width,
            height: this._height,
            pages,
            currentCanvas: this.page.currentID,
        }
    }
    public exportContentJSON(): object {
        const pages: any = {}
        for (const canvas of this.page.list()) {
            pages[canvas.name] = canvas.exportContentJSON()
        }
        return {
            width: this._width,
            height: this._height,
            pages,
            currentCanvas: this.page.currentID,
        }
    }
    public async reLoadFromJSON(json: object): Promise<boolean> {
        json = deepClone(json)
        this.eventBus.emit(EventTypes.loadJSONBefore, { json })
        const { width, height, pages, currentCanvas } = json as any;
        if (!pages) return false
        this.history.disable()

        await this.font.resolveMissingFonts(json)

        this.page.clearAll()

        if (width)
            this._width = width
        if (height)
            this._height = height

        const isArray = Array.isArray(pages);
        for (let id in pages) {
            const pageData = pages[id]
            if (isArray)
                id = generateID()

            pageData.width = pageData.width || this._width
            pageData.height = pageData.height || this._height
            pageData.name = pageData.name || id
            const canvas = Canvas.fromJSON(pageData)
            this.page.addCanvas(id, canvas)
            this.page.setCurrent(id)
        }
        if (currentCanvas)
            this.page.setCurrent(currentCanvas)
        else
            this.page.setCurrent(this.page.list()[0]!.name)
        this.eventBus.emit(EventTypes.loadJSONAfter, { json })
        this.history.enable()
        this.zoom('fit')
        this.refreshTextFonts()
        return true
    }

    public async appendPagesFromJSON(json: object): Promise<boolean> {
        json = deepClone(json)
        this.eventBus.emit(EventTypes.loadJSONBefore, { json })
        const { pages } = json as any;
        if (!pages) return false

        await this.font.resolveMissingFonts(json)

        // this.history.disable()
        for (let id in pages) {
            const pageData = pages[id]
            id = generateID()
            pageData['name'] = id
            const canvas = Canvas.fromJSON(pageData)
            this.page.addCanvas(id, canvas)
            this.page.setCurrent(id)
        }
        this.eventBus.emit(EventTypes.loadJSONAfter, { json })
        // this.history.enable()
        this.zoom('fit')
        this.refreshTextFonts()
        return true
    }

    private refreshTextFonts() {
        const frame = this.page.current?.contentFrame
        if (!frame) return
        const texts = frame.find({ tag: Tag.Text }) as IUI[]
        if (!texts || texts.length === 0) return
        texts.forEach((text) => text.forceUpdate('fontFamily'))
        frame.forceRender()
    }

    public canvasResize(width: number, height: number) {
        this._width = width
        this._height = height
        this.page.current.resize(width, height)
        this.eventBus.emit(EventTypes.canvasResize, { width, height })
    }
    public setNormalizeAttr(child: IUI) {
        child.id = generateID()
        child.name = child.name || ""
        child.zIndex = child.zIndex || 0
        child.editable = child.editable || true
        if (child.tag === Tag.Group) {
            child.hitChildren = false
            child.children?.forEach(this.setNormalizeAttr.bind(this))
        }
    }

    public add(_child: IUI, _index?: number) {
        this.eventBus.emit(EventTypes.canvasAddBefore, { _child: [_child], _index })
        this.page.current.add(_child, _index)
        this.select(_child)
        this.history.save()
        this.eventBus.emit(EventTypes.canvasAddAfter, { _child: [_child], _index })
    }
    public addMany(children: IUI[]) {
        this.eventBus.emit(EventTypes.canvasAddBefore, { _child: children, _index: 0 })
        children.forEach((child) => {
            this.page.current.add(child)
        })
        // this.select(children)
        this.history.save()
        this.eventBus.emit(EventTypes.canvasAddAfter, { _child: children, _index: 0 })
    }

    public remove(_child?: string | number | IUI | IFindCondition | IFindUIMethod | undefined, _destroy?: boolean) {
        this.eventBus.emit(EventTypes.canvasRemoveBefore, { _child, _destroy })
        if (_child === undefined) {
            this.selected.forEach((ui) => {
                ui.remove(undefined, _destroy)
            })
            this.cancel()
        } else if (_child instanceof UI) {
            _child.remove(undefined, _destroy)
        } else {
            const ui = this.page.current.contentFrame.findOne(_child)
            if (ui) {
                ui.remove(undefined, _destroy)
            }
        }
        this.history.save()
        this.eventBus.emit(EventTypes.canvasRemoveAfter, { _child, _destroy })
    }

    public removeEmptyGroup(): void {
        const __remove = (g: IUI[]) => {
            let removeList: IUI[] = []
            for (const ui of g) {
                if (ui.tag === 'Group' && ui.children?.length === 0) {
                    removeList.push(ui)
                } else if (ui.tag === 'Group') {
                    __remove(ui.children || [])
                }
            }
            removeList.forEach((ui) => {
                this.eventBus.emit(EventTypes.canvasRemoveBefore, { _child: ui, _destroy: true })
                ui.remove(undefined, true)
                this.eventBus.emit(EventTypes.canvasRemoveAfter, { _child: ui, _destroy: true })
            })
        }

        __remove(this.page.current.contentFrame.children)
    }
    public group(): boolean {
        if (this.selected.length <= 1) {
            return false
        }
        const index = Math.max(...this.selected.map((ui) => ui.zIndex || 0)) + .5
        const parent = findLowestCommonAncestor<IUI>(this.selected)
        const group = this.app.editor.group()
        this.layer.normalizeZIndexes(group.children)
        group.hitChildren = false
        this.page.current.add(group, index, parent)
        this.history.save()
        return true
    }
    public ungroup() {
        if (this.selected.length <= 0) {
            return
        }
        if (this.selected.length === 1 && this.selected[0]!.tag === Tag.Group) {
            const groupZIndex = this.selected[0]!.zIndex || 0
            this.selected[0]!.children?.forEach((ui) => {
                ui.zIndex = groupZIndex + ((ui.zIndex || 1) * UNGROUP_ZINDEX_FRACTION)
            })
        }
        this.app.editor.ungroup()
        this.history.save()
    }

    public get selected(): IUI[] {
        return this.app.editor.list
    }

    private registerEvents() {
        const debouncedSave = debounce(() => this.history.save(), 200)

        this.app.on(PointerEvent.DOWN, () => {
            // 指针进入本画布时把焦点交给 view，使实例级快捷键作用于当前编辑器；
            // 但不抢占正在输入的表单元素，避免打断文本编辑。
            const ae = document.activeElement as HTMLElement | null
            const editable = !!ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)
            if (!editable && ae !== this.view) {
                this.view.focus()
            }
        })

        this.app.on(PointerEvent.UP, (e: PointerEvent) => {
            if (e.buttons !== 1) return
            debouncedSave()
        })
        this.app.tree.on(DragEvent.END, (e: DragEvent) => {
            debouncedSave()
        })
        this.app.tree.on(ResizeEvent.RESIZE, (e: ResizeEvent) => {
            this.zoom('fit')
        })

        this.app.editor.on(EditorEvent.BEFORE_SELECT, (e: EditorEvent) => {
            this.eventBus.emit(EventTypes.selectedBefore, e.editor.list)
        })

        this.app.editor.on(EditorEvent.SELECT, (e: EditorEvent) => {
            const ae = document.activeElement as HTMLElement | null
            if (ae && ae !== document.body && ae !== this.view) {
                ae.blur();
                this.view.focus();
            }
            const list = e.editor.list
            if (list.length === 0) {
                this.eventBus.emit(EventTypes.cancelSelected, null)
                return
            }
            this.eventBus.emit(EventTypes.selected, list)
        })

        this.app.tree.on(ZoomEvent.ZOOM, (e: ZoomEvent) => {
            const currentScale = this.currentScale * e.scale
            const min = this.app.config.zoom?.min || 1
            const max = this.app.config.zoom?.max || 1
            if (currentScale < min) {
                this.currentScale = min
            } else if (currentScale > max) {
                this.currentScale = max
            } else {
                this.currentScale = currentScale
            }
        })

        this.app.tree.on(PropertyEvent.CHANGE, (e: PropertyEvent) => {
            this.eventBus.emit(EventTypes.canvasChange, e)
        })
    }

    public export(_filename: string, _options?: number | boolean | IExportOptions | undefined) {
        return this.page.current.export(_filename, _options)
    }
    public exportSync(_filename: IExportFileType | string, _options?: IExportOptions | number | boolean) {
        return this.page.current.exportSync(_filename, _options)
    }
    public exportContentAndSky(_filename: string, _options?: number | boolean | IExportOptions | undefined) {
        return this.page.current.exportContentAndSky(_filename, _options)
    }
    public exportSyncContentAndSky(_filename: IExportFileType | string, _options?: IExportOptions | number | boolean) {
        return this.page.current.exportSyncContentAndSky(_filename, _options)
    }

    public get app() {
        return this._app
    }

    public destroy() {
        this.clearPlugins()
        this.history.destroy()
        this.page.destroy()
        this.mode.destroy()
        this.font.destroy()
        this.eventBus.clear()
        this.app.destroy()
    }
}

