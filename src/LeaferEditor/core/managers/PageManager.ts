import type { LeaferEditor } from "../editor";
import { Canvas } from "../canvas";
import { EventTypes } from "../events";
import { generateID } from "../utils";

export class PageManager {
    private _pages: Map<string, Canvas> = new Map();
    private _currentCanvas!: Canvas;

    constructor(private editor: LeaferEditor) { }

    get current(): Canvas {
        return this._currentCanvas;
    }

    get currentID(): string {
        return this._currentCanvas.name;
    }

    list(): Canvas[] {
        return Array.from(this._pages.values());
    }

    add(id?: string, setCurrent: boolean = true, _metaData?: object): string {
        if (!id) {
            id = generateID();
        }
        if (this._pages.has(id)) {
            throw new Error(`Page ${id} already exists`);
        }
        const canvas = this.newCanvas(id,);
        if (_metaData) {
            canvas.metaData = _metaData;
        }
        this._add(id, canvas);
        if (setCurrent) {
            this.setCurrent(id);
        }
        return id;
    }

    setCurrent(id: string): boolean {
        const canvas = this._pages.get(id);
        if (canvas) {
            this._switchTo(canvas);
            return true;
        }
        return false;
    }

    remove(id: string): void {
        if (!id) {
            throw new Error("Page id is required");
        }
        if (this._pages.size === 1) {
            throw new Error("Cannot remove the last page");
        }
        const canvas = this._pages.get(id);
        if (canvas) {
            this.editor.eventBus.emit(EventTypes.pageRemoveBefore, id);
            if (canvas === this._currentCanvas) {
                this.next();
            }
            this._pages.delete(id);
            this.editor.history.removeForCanvas(id);
            canvas.destroy();
            this.editor.eventBus.emit(EventTypes.pageRemoveAfter, id);
        }
    }

    next(): void {
        if (this._pages.size <= 1) return;
        const keys = Array.from(this._pages.keys());
        const index = keys.indexOf(this._currentCanvas.name);
        const nextIndex = (index + 1) % keys.length;
        const nextId = keys[nextIndex] || this._currentCanvas.name;
        this.setCurrent(nextId);
    }

    prev(): void {
        if (this._pages.size <= 1) return;
        const keys = Array.from(this._pages.keys());
        const index = keys.indexOf(this._currentCanvas.name);
        const prevIndex = (index - 1 + keys.length) % keys.length;
        const prevId = keys[prevIndex] || this._currentCanvas.name;
        this.setCurrent(prevId);
    }

    has(id: string): boolean {
        return this._pages.has(id);
    }

    addCanvas(id: string, canvas: Canvas): void {
        this._add(id, canvas);
    }

    clearAll(): void {
        this.editor.cancel()
        this.editor.app.tree.removeAll()
        for (const canvas of this._pages.values()) {
            this.editor.history.removeForCanvas(canvas.name)
            canvas.destroy()
        }
        this._pages.clear()
    }

    destroy(): void {
        this.clearAll();
    }

    private _add(id: string, canvas: Canvas): void {
        const param = { oldId: this._currentCanvas?.name || id, newId: id };
        this.editor.eventBus.emit(EventTypes.pageAddBefore, param);
        this._pages.set(id, canvas);
        this.editor.history.initForCanvas(canvas, this.editor.options.history?.maxSize);
        this.editor.eventBus.emit(EventTypes.pageAddAfter, param);
    }

    private _switchTo(canvas: Canvas): void {
        const param = {
            oldId: this._currentCanvas?.name,
            newId: canvas.name,
        };
        this.editor.mode.setNormal();
        this.editor.eventBus.emit(EventTypes.pageChangeBefore, param);
        this.editor.cancel();
        this.editor.app.tree.removeAll();
        this._currentCanvas = canvas;
        canvas.bindLeafer(this.editor.app.tree);
        this.editor.eventBus.emit(EventTypes.pageChangeAfter, param);
        if (this.editor.options.page?.changePageZoomFit) {
            this.editor.zoom("fit");
        }
    }

    initDefault(): void {
        const defaultID = "DefaultCanvas_" + generateID();
        this._currentCanvas = this.newCanvas(defaultID);
        this._pages.clear();
        this._add(defaultID, this._currentCanvas);
        this._switchTo(this._currentCanvas);
        // this.clearAll()
        // this.add(defaultID, true)
    }

    private newCanvas(id: string): Canvas {
        return new Canvas(
            id,
            this.editor.canvasWidth,
            this.editor.canvasHeight,
            0,
            0,
            this.editor.options.canvas?.contentFill,
        );
    }
}
