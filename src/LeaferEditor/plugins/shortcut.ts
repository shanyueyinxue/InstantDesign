import Mousetrap from "mousetrap"

import type { IPlugin, IPluginHost } from "../core/interfaces";
import type { LeaferEditor } from "../core/editor";
import { ShortcutPluginServiceName } from "./interfaces";
import type { IShortcutPluginService, ShortcutPluginOptions } from "./interfaces";
import * as ops from "./editorOperations";

export const ShortcutPluginName = "shortcut"

const MOVE_PIXEL_STEP = 1
const MOVE_PIXEL_FAST = 10

export class ShortcutPlugin implements IPlugin<LeaferEditor, ShortcutPluginOptions>, IShortcutPluginService {
    name: string = ShortcutPluginName

    _editor: LeaferEditor | null = null

    private _mt: Mousetrap.MousetrapInstance | null = null

    public get editor(): LeaferEditor {
        if (!this._editor) throw new Error("Plugin not installed")
        return this._editor as LeaferEditor
    }

    install(host: IPluginHost<LeaferEditor>, options: ShortcutPluginOptions = {}) {
        this._editor = host.getInstance()
        const target = options.global ? document : this._editor.view
        this._mt = new Mousetrap(target as Element)
        this.bindShortcuts()
        host.registerService({
            name: ShortcutPluginServiceName,
            service: this,
            description: "Shortcut plugin",
            plugin: this,
        })
    }

    public bindShortcut(
        keys: string | string[],
        callback: (e: Mousetrap.ExtendedKeyboardEvent, combo: string) => boolean | void
    ) {
        this._mt?.bind(keys, callback)
    }

    public trigger(combo: string, action?: string) {
        this._mt?.trigger(combo, action)
    }

    private bind(key: string | string[], handler: () => boolean | void, action?: string) {
        this._mt?.bind(key, handler, action)
    }

    private bindShortcuts() {
        const e = () => this.editor

        this.bind('mod+z', () => { ops.undo(e()); return false })
        this.bind(['mod+y', 'mod+shift+z'], () => { ops.redo(e()); return false })
        this.bind('mod+a', () => { ops.selectAll(e()); return false })
        this.bind('esc', () => { ops.cancel(e()); return false })
        this.bind(['del', 'backspace'], () => {
            if (e().selected.length === 0) return true;  // 未选中时，不执行删除操作
            if (e().app.editor.innerEditor) return true; // 内部编辑器时，不执行删除操作
            ops.deleteSelected(e());
            return false
        })

        this.bind('mod+left', () => { ops.pagePrev(e()); return false })
        this.bind('mod+right', () => { ops.pageNext(e()); return false })

        this.bind('mod+0', () => { ops.zoomFit(e()); return false })
        this.bind('mod+1', () => { ops.zoomTo(e(), 1); return false })
        this.bind('-', () => { ops.zoomOut(e()); return false })
        this.bind('+', () => { ops.zoomIn(e()); return false })
        this.bind('0 0', () => { ops.zoomTo(e(), .5); return false })

        this.bind('[', () => { ops.zIndexMoveDown(e()); return false })
        this.bind(']', () => { ops.zIndexMoveUp(e()); return false })
        this.bind('mod+[', () => { ops.zIndexMoveToBottom(e()); return false })
        this.bind('mod+]', () => { ops.zIndexMoveToTop(e()); return false })

        this.bind('mod+g', () => { ops.group(e()); return false })
        this.bind('mod+shift+g', () => { ops.ungroup(e()); return false })

        this.bind('h', () => { ops.toggleGrid(e()); return false })

        this.bind('mod+c', () => { ops.copy(e()); return false })
        this.bind('mod+x', () => { ops.cut(e()); return false })
        this.bind('mod+v', () => { ops.paste(e()) })

        this.bind('shift+h', () => { ops.flipH(e()); return false })
        this.bind('shift+v', () => { ops.flipV(e()); return false })

        this.bind('m', () => { ops.setPreview(e()); return false })
        this.bind('v', () => { ops.setNormal(e()); return false })
        this.bind('p', () => { ops.setDraw(e()); return false })

        this.bind('l', () => { ops.toggleLock(e()); return false })

        // , . 旋转
        this.bind(',', () => { ops.rotate(e(), -90); return false })
        this.bind('.', () => { ops.rotate(e(), 90); return false })
        this.bind('mod+,', () => { ops.rotate(e(), -45); return false })
        this.bind('mod+.', () => { ops.rotate(e(), 45); return false })

        // WASD 移动 — keydown 移动，keyup 延迟保存
        this.bind('w', () => { ops.moveBy(e(), 0, -MOVE_PIXEL_STEP); return false })
        this.bind('shift+w', () => { ops.moveBy(e(), 0, -MOVE_PIXEL_FAST); return false })
        this.bind('s', () => { ops.moveBy(e(), 0, MOVE_PIXEL_STEP); return false })
        this.bind('shift+s', () => { ops.moveBy(e(), 0, MOVE_PIXEL_FAST); return false })
        this.bind('a', () => { ops.moveBy(e(), -MOVE_PIXEL_STEP, 0); return false })
        this.bind('shift+a', () => { ops.moveBy(e(), -MOVE_PIXEL_FAST, 0); return false })
        this.bind('d', () => { ops.moveBy(e(), MOVE_PIXEL_STEP, 0); return false })
        this.bind('shift+d', () => { ops.moveBy(e(), MOVE_PIXEL_FAST, 0); return false })

        // 方向键移动
        // const dirMove = (dx: number, dy: number) => () => { ops.moveBy(e(), dx, dy); return false }
        // this.bind('left', dirMove(-1, 0))
        // this.bind('right', dirMove(1, 0))
        // this.bind('up', dirMove(0, -1))
        // this.bind('down', dirMove(0, 1))
        // this.bind('shift+left', dirMove(-10, 0))
        // this.bind('shift+right', dirMove(10, 0))
        // this.bind('shift+up', dirMove(0, -10))
        // this.bind('shift+down', dirMove(0, 10))

        // WASD + 方向键 keyup 延迟保存
        const save = () => { ops.moveSave(e()); return false }
        this.bind('w', save, 'keyup')
        this.bind('s', save, 'keyup')
        this.bind('a', save, 'keyup')
        this.bind('d', save, 'keyup')
        this.bind('shift+w', save, 'keyup')
        this.bind('shift+s', save, 'keyup')
        this.bind('shift+a', save, 'keyup')
        this.bind('shift+d', save, 'keyup')
        this.bind('left', save, 'keyup')
        this.bind('right', save, 'keyup')
        this.bind('up', save, 'keyup')
        this.bind('down', save, 'keyup')
        this.bind('shift+left', save, 'keyup')
        this.bind('shift+right', save, 'keyup')
        this.bind('shift+up', save, 'keyup')
        this.bind('shift+down', save, 'keyup')
    }

    uninstall(host: IPluginHost<LeaferEditor>): void {
        host.unregisterService(ShortcutPluginServiceName)
        this._mt?.reset()
        this._mt = null
        this._editor = null
    }
}
