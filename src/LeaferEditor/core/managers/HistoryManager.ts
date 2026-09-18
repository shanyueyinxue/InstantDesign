import LZString from "lz-string";
import type { LeaferEditor } from "../editor";
import { EventTypes } from "../events";
import { History } from "../history";
import type { Canvas } from "../canvas";
import { NoLayer } from "../canvas";
import { cleanEmptyValues } from "../utils/cleanEmpty";

export interface HistoryManagerOptions {
    enabled: boolean;
    maxSize: number;
}

export class HistoryManager {
    private _enabled: boolean;
    private _maxSize: number;
    private _histories: Map<string, History> = new Map();

    constructor(private editor: LeaferEditor, options: HistoryManagerOptions) {
        this._enabled = options.enabled;
        this._maxSize = options.maxSize;
        this.editor.eventBus.on(EventTypes.pageRemoveAfter, this._onPageRemoved);
    }

    private _onPageRemoved = (pageId: string) => {
        this._histories.delete(pageId);
    };

    destroy(): void {
        this.editor.eventBus.off(EventTypes.pageRemoveAfter, this._onPageRemoved);
        for (const history of this._histories.values()) {
            history.destroy();
        }
        this._histories.clear();
    }

    private get _active(): boolean {
        return this._enabled;
    }

    private get _current(): History | null {
        if (!this._active) return null;
        return this._histories.get(this.editor.page.currentID) ?? null;
    }

    private serializeState(canvas: Canvas): string {
        let data = canvas.contentFrame.toJSON();
        // 过滤掉 NoLayer 元素
        if (data.children) {
            data.children = data.children.filter(
                (child: any) => child.className !== NoLayer
            );
        }
        data = cleanEmptyValues(data, (k, v, _parent, _defaultFn) => _defaultFn(v));
        let dataStr = JSON.stringify(data);
        dataStr = LZString.compress(dataStr);
        return dataStr;
    }

    private deserializeState(canvas: Canvas, compressed: string): void {
        const state = LZString.decompress(compressed);
        canvas.contentFrame.set(JSON.parse(state));
        if (
            canvas.contentFrame.width !== canvas.width ||
            canvas.contentFrame.height !== canvas.height
        ) {
            canvas.resize(
                (canvas.contentFrame.width as number) || canvas.width,
                (canvas.contentFrame.height as number) || canvas.height
            );
        }
    }

    initForCanvas(canvas: Canvas, maxSize?: number): void {
        if (!this._active) return;
        const history = new History({
            maxSize: maxSize ?? this._maxSize,
            historySavedData: () => this.serializeState(canvas),
            onStateChange: (state, type) => {
                if (state && (type === 'undo' || type === 'redo')) {
                    this.deserializeState(canvas, state);
                }
            },
            shouldSave: (prev, next) => prev === null || prev !== next,
        });
        history.saveState();
        this._histories.set(canvas.name, history);
    }

    removeForCanvas(id: string): void {
        const history = this._histories.get(id);
        history?.destroy();
        this._histories.delete(id);
    }

    undo(): void {
        if (!this._current) return;
        this.editor.mode.setNormal();
        this.editor.cancel();
        const state = this._current.undo();
        this.editor.app.start();
        this.editor.eventBus.emit(EventTypes.undoRedoStackChange, state);
    }

    redo(): void {
        if (!this._current) return;
        this.editor.mode.setNormal();
        this.editor.cancel();
        const state = this._current.redo();
        this.editor.app.start();
        this.editor.eventBus.emit(EventTypes.undoRedoStackChange, state);
    }

    clear(): void {
        if (!this._current) return;
        this.editor.cancel();
        this._current.clear();
    }

    disable(): void {
        if (!this._current) return;
        this._current.disabledHistory();
    }

    enable(): void {
        if (!this._current) return;
        this._current.enableHistory();
    }

    isEnabled(): boolean {
        if (!this._current) return false;
        return this._current.isEnabled();
    }

    save(): void {
        if (!this._current) return;
        if (this._current.saveState()) {
            this.editor.eventBus.emit(
                this.editor.Events.historyStateSavedAfter,
                {
                    state: this._current.getCurrentState(),
                    pageId: this.editor.page.currentID,
                }
            );
        }
    }

    getCurrentState(): any {
        if (!this._current) return null;
        return this._current.getCurrentState();
    }

    canUndo(): boolean {
        if (!this._current) return false;
        return this._current.canUndo();
    }

    canRedo(): boolean {
        if (!this._current) return false;
        return this._current.canRedo();
    }

    info(): any {
        if (!this._current) return { undoCount: 0, redoCount: 0 };
        return this._current.getHistoryInfo();
    }
}
