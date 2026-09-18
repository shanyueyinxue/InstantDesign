import { ContextMenu } from "./contextMenu/index"
import type { MenuFuncOptions, MenuOptions } from "./interfaces"
import { t } from "../i18n"
import * as predefine from "../core/utils/predefine"

import type { IPlugin, IPluginHost } from "../core/interfaces";
import type { LeaferEditor } from "../core/editor";
import { generateID } from "../core/utils"
import {
    ContextMenuPluginServiceName,
    type IContextMenuPluginService,
} from "./interfaces"
import * as ops from "./editorOperations";

export const ContextMenuPluginName = "ContextMenu"

const EXPORT_MAX_DIMENSION = 15000

export class ContextMenuPlugin implements IPlugin<LeaferEditor>, IContextMenuPluginService {
    name: string = ContextMenuPluginServiceName
    description: string = "context menu plugin"

    _editor: LeaferEditor | null = null

    public get plugin() { return this }
    public get service() { return this }

    public get editor(): LeaferEditor {
        if (!this._editor) throw new Error("Plugin not installed")
        return this._editor as LeaferEditor
    }

    private contextMenu: ContextMenu | null = null

    private _hideMenuHandler = (e: MouseEvent) => {
        if (!this.contextMenu?.isShow()) return
        const { top, left, width, height } = this.editor.view.getBoundingClientRect()
        if (e.clientX < left || e.clientX > left + width || e.clientY < top || e.clientY > top + height) {
            this.contextMenu?.hideMenu()
        }
    }

    install(host: IPluginHost<LeaferEditor>) {
        this._editor = host.getInstance()
        this.contextMenu = new ContextMenu(this.editor.app, { menuList: [] })
        this.registerContextMenus()
        host.registerService(this)
    }

    public registerContextMenu(menu: MenuFuncOptions | MenuFuncOptions[]) {
        this.contextMenu?.addMenu(menu)
    }

    public unRegisterContextMenu(key: string) {
        this.contextMenu?.removeMenu(key)
    }

    private registerContextMenus() {
        const e = () => this.editor
        const cf = () => this.editor.page.current.contentFrame

        this.editor.eventBus.on(this.editor.Events.historyStateSavedAfter, () => {
            this.contextMenu?.hideMenu()
        })

        window.addEventListener('click', this._hideMenuHandler)
        window.addEventListener('contextmenu', this._hideMenuHandler)

        // 新增元素
        this.contextMenu?.addMenu(() => ({
            title: t("leaferEditorPlugins.add.title"),
            key: 'add', desc: 'add element', type: 'ZERO',
            children: [
                {
                    title: t("leaferEditorPlugins.add.rect.title"), key: 'add-rect', type: 'ALL', desc: 'rect',
                    children: [
                        {
                            title: t("leaferEditorPlugins.add.rect.rect"), key: 'add-rect-rect', type: 'ALL',
                            callback: (ev) => { const { x, y } = ev.pointerEvent.getLocalPoint(cf()); e().add(predefine.rect({ x, y })) }
                        },
                        {
                            title: t("leaferEditorPlugins.add.rect.round"), key: 'add-rect-round', type: 'ALL',
                            callback: (ev) => { const { x, y } = ev.pointerEvent.getLocalPoint(cf()); e().add(predefine.roundedRect({ x, y })) }
                        },
                    ]
                },
                {
                    title: t("leaferEditorPlugins.add.polygon.title"), key: 'add-polygon', desc: 'polygon', type: 'ALL',
                    children: [
                        {
                            title: t("leaferEditorPlugins.add.polygon.triangle"), key: 'add-polygon-triangle', type: 'ALL',
                            callback: (ev) => { const { x, y } = ev.pointerEvent.getLocalPoint(cf()); e().add(predefine.triangle({ x, y })) }
                        },
                        {
                            title: t("leaferEditorPlugins.add.polygon.pentagon"), key: 'add-polygon-pentagon', type: 'ALL',
                            callback: (ev) => { const { x, y } = ev.pointerEvent.getLocalPoint(cf()); e().add(predefine.pentagon({ x, y })) }
                        },
                        {
                            title: t("leaferEditorPlugins.add.polygon.roundedPentagon"), key: 'add-polygon-roundedPentagon', type: 'ALL',
                            callback: (ev) => { const { x, y } = ev.pointerEvent.getLocalPoint(cf()); e().add(predefine.roundedPentagon({ x, y })) }
                        },
                    ]
                },
                {
                    title: t("leaferEditorPlugins.add.star.title"), key: 'add-star', desc: 'star', type: 'ALL',
                    children: [
                        {
                            title: t("leaferEditorPlugins.add.star.threeStar"), key: 'add-star-threeStar', type: 'ALL',
                            callback: (ev) => { const { x, y } = ev.pointerEvent.getLocalPoint(cf()); e().add(predefine.threeStar({ x, y })) }
                        },
                        {
                            title: t("leaferEditorPlugins.add.star.pentagram"), key: 'add-star-pentagram', type: 'ALL',
                            callback: (ev) => { const { x, y } = ev.pointerEvent.getLocalPoint(cf()); e().add(predefine.pentagram({ x, y })) }
                        },
                        {
                            title: t("leaferEditorPlugins.add.star.roundedStar"), key: 'add-star-roundedStar', type: 'ALL',
                            callback: (ev) => { const { x, y } = ev.pointerEvent.getLocalPoint(cf()); e().add(predefine.roundedStar({ x, y })) }
                        },
                    ]
                },
                {
                    title: t("leaferEditorPlugins.add.ellipse.title"), key: 'add-ellipse', desc: 'ellipse', type: 'ALL',
                    children: [
                        {
                            title: t("leaferEditorPlugins.add.ellipse.circle"), key: 'add-ellipse-circle', type: 'ALL',
                            callback: (ev) => { const { x, y } = ev.pointerEvent.getLocalPoint(cf()); e().add(predefine.ellipse({ x, y })) }
                        },
                        {
                            title: t("leaferEditorPlugins.add.ellipse.ring"), key: 'add-ellipse-ring', type: 'ALL',
                            callback: (ev) => { const { x, y } = ev.pointerEvent.getLocalPoint(cf()); e().add(predefine.ring({ x, y })) }
                        },
                        {
                            title: t("leaferEditorPlugins.add.ellipse.sector"), key: 'add-ellipse-sector', type: 'ALL',
                            callback: (ev) => { const { x, y } = ev.pointerEvent.getLocalPoint(cf()); e().add(predefine.sector({ x, y })) }
                        },
                        {
                            title: t("leaferEditorPlugins.add.ellipse.ellipse"), key: 'add-ellipse-ellipse', type: 'ALL',
                            callback: (ev) => { const { x, y } = ev.pointerEvent.getLocalPoint(cf()); e().add(predefine.ellipse2({ x, y })) }
                        },
                    ]
                },
                {
                    title: t("leaferEditorPlugins.add.text"), key: "add-text", type: "ZERO",
                    callback: (ev) => { const { x, y } = ev.pointerEvent.getLocalPoint(cf()); e().add(predefine.text({ x, y })) }
                },
                {
                    title: t("leaferEditorPlugins.add.image"), key: "add-image", type: "ZERO",
                    callback: () => { e().image.open().then(img => e().add(img)) }
                },
            ]
        }))

        this.contextMenu?.addMenu(() => ({
            title: t("leaferEditorPlugins.selectAll"), key: 'all-select', desc: 'mod+a', type: 'ZERO',
            callback: () => ops.selectAll(e())
        }))

        // 剪贴板
        this.contextMenu?.addMenu([
            () => ({
                title: t('leaferEditorPlugins.copy'), desc: 'mod+c', key: 'copy', type: ['ONE', 'SOME'],
                callback: () => ops.copy(e())
            }),
            () => ({
                title: t('leaferEditorPlugins.cut'), desc: 'mod+x', key: 'cut', type: ['ONE', 'SOME'],
                callback: () => ops.cut(e())
            }),
            () => ({
                title: t('leaferEditorPlugins.paste'), desc: 'mod+v', key: 'paste', type: 'ZERO',
                callback: () => ops.paste(e()),
                showCallback: () => e().clipboard.hasItems
            }),
            () => ({
                title: t('leaferEditorPlugins.pasteToCurrentPosition'), key: 'paste-to-current-position', type: 'ZERO',
                callback: (ev) => {
                    const local = ev.pointerEvent.getLocalPoint(cf())
                    ops.pasteAtPosition(e(), local.x, local.y)
                },
                showCallback: () => e().clipboard.hasItems
            }),
        ])

        // 层级调整
        this.contextMenu?.addMenu(() => ({
            title: t("leaferEditorPlugins.zIndex.adjustment"), key: "z-index-adjustment", type: "ONE",
            children: [
                {
                    title: t('leaferEditorPlugins.zIndex.up'), key: 'z-index-up', desc: ']', type: 'ONE',
                    callback: () => ops.zIndexMoveUp(e())
                },
                {
                    title: t('leaferEditorPlugins.zIndex.down'), key: 'z-index-down', desc: '[', type: 'ONE',
                    callback: () => ops.zIndexMoveDown(e())
                },
                {
                    title: t('leaferEditorPlugins.zIndex.top'), key: 'z-index-top', desc: 'mod+]', type: 'ONE',
                    callback: () => ops.zIndexMoveToTop(e())
                },
                {
                    title: t('leaferEditorPlugins.zIndex.bottom'), key: 'z-index-bottom', desc: 'mod+[', type: 'ONE',
                    callback: () => ops.zIndexMoveToBottom(e())
                },
            ]
        }))

        // 视图缩放
        this.contextMenu?.addMenu([
            () => ({
                title: t('leaferEditorPlugins.zoom.management'), key: 'zoom-management', type: 'ZERO',
                children: [
                    {
                        title: t('leaferEditorPlugins.zoom.out'), key: 'zoom-out', desc: '-', type: 'ZERO',
                        callback: () => ops.zoomOut(e())
                    },
                    {
                        title: t('leaferEditorPlugins.zoom.in'), key: 'zoom-in', desc: '+', type: 'ZERO',
                        callback: () => ops.zoomIn(e())
                    },
                    {
                        title: t('leaferEditorPlugins.zoom.fit'), key: 'zoom-fit', desc: 'mod+0', type: 'ZERO',
                        callback: () => ops.zoomFit(e())
                    },
                    {
                        title: t("leaferEditorPlugins.zoom.oneHundred"), key: "zoom-reset", desc: 'mod+1', type: 'ZERO',
                        callback: () => ops.zoomTo(e(), 1)
                    },
                ]
            }),
            () => ({
                title: t("leaferEditorPlugins.grid.showOrHide"), key: 'grid-lines-show', desc: 'h', type: 'ZERO',
                callback: () => ops.toggleGrid(e())
            }),
        ])

        // 操作元素
        this.contextMenu?.addMenu(() => ({
            title: t("leaferEditorPlugins.operate.title"), key: "operate", type: ['ONE', 'SOME'],
            children: [
                {
                    title: t("leaferEditorPlugins.operate.lock"), key: 'lock', desc: 'lock', type: ['ONE', 'SOME'],
                    callback: () => {
                        e().selected.forEach(ui => ui.locked = true)
                        e().cancel()
                        e().history.save()
                    },
                    disableCallback: () => e().selected.some(ui => ui.locked)
                },
                {
                    title: t("leaferEditorPlugins.operate.unlock"), key: 'unlock', desc: 'unlock', type: ['ONE', 'SOME'],
                    callback: () => {
                        e().selected.forEach(ui => ui.locked = false)
                        e().history.save()
                    },
                    disableCallback: () => e().selected.some(ui => !ui.locked)
                },
                {
                    title: t("leaferEditorPlugins.operate.fitToCanvas"), key: "operate-fit-to-canvas", type: "ONE",
                    callback: () => {
                        if (e().selected.length === 1) {
                            const ui = e().selected[0]!
                            ui.x = 0; ui.y = 0
                            ui.width = cf().width; ui.height = cf().height
                            e().history.save()
                        }
                    },
                    disableCallback: () => {
                        if (e().selected.length === 1 && e().selected[0]!.tag === 'Group') return true
                        const ui = e().selected[0]!
                        if (ui.x === 0 && ui.y === 0 && ui.width === cf().width && ui.height === cf().height) return true
                        return ui.locked === true
                    }
                },
            ]
        }))

        // 编组
        this.contextMenu?.addMenu([
            () => ({
                title: t("leaferEditorPlugins.group"), key: "group", type: "SOME",
                callback: () => ops.group(e())
            }),
            () => ({
                title: t("leaferEditorPlugins.ungroup"), key: "ungroup", type: "ONE",
                callback: () => ops.ungroup(e()),
                showCallback: () => e().selected.length === 1 && e().selected[0]!.tag === 'Group'
            }),
        ])

        // 删除元素
        this.contextMenu?.addMenu(() => ({
            title: t("leaferEditorPlugins.remove"), key: 'remove', desc: 'del | backspace', type: ['ONE', 'SOME'],
            callback: () => ops.deleteSelected(e())
        }))

        // 导出 PNG
        this.contextMenu?.addMenu(() => ({
            title: t("leaferEditorPlugins.exportPng"), key: "export-png", type: ["ZERO", "ONE"],
            callback: () => {
                const maxSize = EXPORT_MAX_DIMENSION
                if (e().selected.length === 1) {
                    const sel = e().selected[0]!
                    const max = sel.width! > sel.height! ? 'width' : 'height'
                    const sz = sel[max]! > maxSize ? maxSize : sel[max]!
                    sel.export(`${sel.name}-${sel.id}.png`, { size: { [max]: sz } }).catch(console.error)
                } else {
                    const max = cf().width as number > (cf().height as number) ? 'width' : 'height'
                    const sz = cf()[max]! > maxSize ? maxSize : cf()[max]!
                    e().export(`canvas-${generateID()}.png`, { size: { [max]: sz } }).catch(console.error)
                }
            }
        }))
    }

    uninstall() {
        window.removeEventListener('click', this._hideMenuHandler)
        window.removeEventListener('contextmenu', this._hideMenuHandler)
        this.contextMenu?.destroy()
        this.contextMenu = null
        this._editor = null
    }
}
