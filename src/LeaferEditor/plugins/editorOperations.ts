import type { LeaferEditor } from "../core/editor";
import type { IRulerPluginService } from "./interfaces";
import { RulerPluginServiceName } from "./interfaces";
import { debounce } from "../core/utils/debounce";

// ============================================================================
// 历史记录
// ============================================================================

export function undo(editor: LeaferEditor) {
    editor.history.undo()
}

export function redo(editor: LeaferEditor) {
    editor.history.redo()
}

// ============================================================================
// 选择与取消
// ============================================================================

export function selectAll(editor: LeaferEditor) {
    editor.select(editor.page.current.contentLayers.filter(ui => !ui.locked))
}

export function cancel(editor: LeaferEditor) {
    editor.cancel()
}

export function deleteSelected(editor: LeaferEditor) {
    if (editor.selected.length > 0) {
        editor.remove()
    }
}

// ============================================================================
// 页面导航
// ============================================================================

export function pagePrev(editor: LeaferEditor) {
    editor.page.prev()
}

export function pageNext(editor: LeaferEditor) {
    editor.page.next()
}

// ============================================================================
// 缩放
// ============================================================================

export function zoomFit(editor: LeaferEditor) {
    editor.zoom('fit' as any)
}

export function zoomTo(editor: LeaferEditor, scale: number) {
    editor.zoom(scale as any)
}

export function zoomOut(editor: LeaferEditor) {
    editor.zoom('out' as any)
}

export function zoomIn(editor: LeaferEditor) {
    editor.zoom('in' as any)
}

// ============================================================================
// 层级 (zIndex)
// ============================================================================

function singleSelected(editor: LeaferEditor) {
    return editor.selected.length === 1 ? editor.selected[0]! : null
}

export function zIndexMoveUp(editor: LeaferEditor) {
    const ui = singleSelected(editor)
    if (ui) editor.layer.moveUp(ui)
}

export function zIndexMoveDown(editor: LeaferEditor) {
    const ui = singleSelected(editor)
    if (ui) editor.layer.moveDown(ui)
}

export function zIndexMoveToTop(editor: LeaferEditor) {
    const ui = singleSelected(editor)
    if (ui) editor.layer.moveToTop(ui)
}

export function zIndexMoveToBottom(editor: LeaferEditor) {
    const ui = singleSelected(editor)
    if (ui) editor.layer.moveToBottom(ui)
}

// ============================================================================
// 编组
// ============================================================================

export function group(editor: LeaferEditor) {
    editor.group()
}

export function ungroup(editor: LeaferEditor) {
    editor.ungroup()
}

// ============================================================================
// 旋转
// ============================================================================

export function rotate(editor: LeaferEditor, angle: number) {
    // const ui = singleSelected(editor)
    const ui = editor.app.editor.element
    if (!ui) return
    ui.rotateOf('center', angle)
    editor.history.save()
}

// ============================================================================
// 网格线
// ============================================================================

export function toggleGrid(editor: LeaferEditor) {
    const service = editor.getService<IRulerPluginService>(RulerPluginServiceName)
    if (!service) return
    if (service.gridLinesIsShow()) {
        service.gridLinesHide()
    } else {
        service.gridLinesShow()
    }
}

// ============================================================================
// 剪贴板 (copy / cut / paste)
// ============================================================================

export function copy(editor: LeaferEditor) {
    if (!editor.selected.length) return
    editor.clipboard.copy(editor.selected)
    editor.cancel()
}

export function cut(editor: LeaferEditor) {
    if (!editor.selected.length) return
    editor.clipboard.cut(editor.selected)
    editor.cancel()
}

export function paste(editor: LeaferEditor) {
    if (!editor.clipboard.hasItems) return
    const items = editor.clipboard.paste()
    editor.addMany(items)
    editor.select(items)
}

export function pasteAtPosition(editor: LeaferEditor, x: number, y: number) {
    if (!editor.clipboard.hasItems) return
    paste(editor)
    let minX = Infinity, minY = Infinity
    editor.selected.forEach(ui => {
        if ((ui.x as number) < minX) minX = (ui.x as number)
        if ((ui.y as number) < minY) minY = (ui.y as number)
    })
    const ox = x - minX, oy = y - minY
    editor.selected.forEach(ui => {
        const u = ui as any
        u.x += ox
        u.y += oy
    })
    editor.cancel()
}

// ============================================================================
// WASD 移动（含延迟保存）
// ============================================================================

const MOVE_DEBOUNCE_MS = 300
const _moveSaveMap = new WeakMap<LeaferEditor, ReturnType<typeof debounce>>()

function ensureMoveDebounce(editor: LeaferEditor) {
    let db = _moveSaveMap.get(editor)
    if (!db) {
        db = debounce(() => editor.history.save(), MOVE_DEBOUNCE_MS)
        _moveSaveMap.set(editor, db)
    }
    return db
}

export function moveBy(editor: LeaferEditor, dx: number, dy: number) {
    if (editor.selected.length <= 0) return
    editor.selected.forEach(ui => {
        const u = ui as any
        u.x += dx
        u.y += dy
    })
    editor.select(editor.selected)
}

export function moveSave(editor: LeaferEditor) {
    ensureMoveDebounce(editor)()
}

// ============================================================================
// 翻转
// ============================================================================

function activeFlipObject(editor: LeaferEditor) {
    if (!editor.selected.length) return null
    if (editor.selected.length === 1) return editor.selected[0]
    return editor.app.editor.element
}

export function flipH(editor: LeaferEditor) {
    const obj = activeFlipObject(editor)
    if (!obj) return
    (obj as any).flip("x")
    editor.history.save()
}

export function flipV(editor: LeaferEditor) {
    const obj = activeFlipObject(editor)
    if (!obj) return
    (obj as any).flip("y")
    editor.history.save()
}

// ============================================================================
// 模式切换
// ============================================================================

export function setPreview(editor: LeaferEditor) {
    editor.mode.setPreview()
}

export function setNormal(editor: LeaferEditor) {
    editor.mode.setNormal()
}

export function setDraw(editor: LeaferEditor) {
    editor.mode.setDraw()
}

// ============================================================================
// 锁定/解锁
// ============================================================================

export function toggleLock(editor: LeaferEditor) {
    let isLocked = false
    editor.selected.forEach(ui => { if (ui.locked) isLocked = true })
    if (isLocked) {
        editor.selected.forEach(ui => { ui.locked = false })
    } else {
        editor.selected.forEach(ui => { ui.locked = true })
        editor.cancel()
    }
    editor.history.save()
}
