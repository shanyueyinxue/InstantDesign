import type { IUI } from "@leafer-ui/interface";
import type { LeaferEditor } from "../editor";

export class ClipboardManager {
    private _items: IUI[] = [];

    constructor(private editor: LeaferEditor) { }

    get hasItems(): boolean {
        return this._items.length > 0;
    }

    copy(selected: IUI[]): void {
        this._items = [];
        selected.forEach((ui) => {
            const cloneUI = ui.clone();
            this.editor.setNormalizeAttr(cloneUI);
            cloneUI.x = cloneUI.x || 0;
            cloneUI.y = cloneUI.y || 0;
            cloneUI.zIndex = 0;
            cloneUI.name = cloneUI.name + "_copy";
            this._items.push(cloneUI);
        });
    }

    cut(selected: IUI[]): IUI[] {
        const items: IUI[] = [];
        selected.forEach((ui) => {
            const cloneUI = ui.clone();
            this.editor.setNormalizeAttr(cloneUI);
            cloneUI.x = cloneUI.x || 0;
            cloneUI.y = cloneUI.y || 0;
            cloneUI.zIndex = 0;
            items.push(cloneUI);
        });
        this._items = [...items];
        this.editor.select(selected);
        this.editor.remove()
        return items;
    }

    paste(): IUI[] {
        this._items.sort((a, b) => {
            return (a.zIndex || 0) - (b.zIndex || 0);
        });
        const items = [...this._items];
        this._items = [];
        return items;
    }

    clear(): void {
        this._items = [];
    }
}
