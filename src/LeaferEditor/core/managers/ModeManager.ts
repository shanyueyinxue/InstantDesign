import type { IPathInputData, IUI } from "@leafer-ui/interface";
import { Pen, Group, DragEvent, type IEventListenerId } from "leafer-ui";
import type { LeaferEditor } from "../editor";
import { EventTypes } from "../events";

export class ModeManager {
    private _mode: string = "normal";
    private _drawModeEvents: IEventListenerId[] = [];
    private _drawPenDefaultStyle: IPathInputData = {
        stroke: "red",
        strokeWidth: 2,
    };
    private _drawPenStyle: IPathInputData = {};

    constructor(private editor: LeaferEditor) {}

    get current(): string {
        return this._mode;
    }

    get penStyle(): IPathInputData {
        return this._drawPenStyle;
    }

    setPenStyle(style?: IPathInputData): void {
        this._drawPenStyle = {
            ...this._drawPenDefaultStyle,
            ...style,
        };
    }

    setPreview(): void {
        if (this._mode === "preview") return;
        this.editor.cancel();
        this.editor.app.mode = "preview";
        this.editor.app.config.move!.drag = true;
        this._offDrawModeEvents();
        this._mode = "preview";
        this.editor.eventBus.emit(EventTypes.changeMode, "preview");
    }

    setNormal(): void {
        if (this._mode === "normal") return;
        this.editor.app.mode = "normal";
        this.editor.app.config.move!.drag = false;
        this._offDrawModeEvents();
        this._mode = "normal";
        this.editor.eventBus.emit(EventTypes.changeMode, "normal");
    }

    setDraw(): void {
        if (this._mode === "draw") return;
        this.editor.cancel();
        this.editor.app.mode = "draw";
        this.editor.app.config.move!.drag = false;
        if (Object.keys(this._drawPenStyle).length === 0) {
            this.setPenStyle();
        }
        let pen: Pen | null = null;
        let group: Group | null = null;
        let isAddGroup = false;
        let index = 1;
        const contentFrame = this.editor.page.current.contentFrame;
        const drawGroups = contentFrame.find(".draw-group") as IUI[];

        this._drawModeEvents = [
            this.editor.app.on_(DragEvent.START, (e: DragEvent) => {
                if (!group) {
                    group = new Group({
                        x: 0,
                        y: 0,
                        name: "drawGroup-" + (drawGroups.length + 1),
                        className: "draw-group",
                        hitChildren: false,
                        editable: true,
                    });
                }
                pen = new Pen({
                    hitChildren: false,
                    editable: true,
                });
                pen.setStyle(this._drawPenStyle);
                const { x, y } = e.getLocalPoint(contentFrame);
                pen.moveTo(x, y);

                if (!isAddGroup) {
                    this.editor.page.current.add(group);
                    isAddGroup = true;
                }
                this.editor.page.current.add(pen, index);
                index++;
                group.add(pen);
            }),
            this.editor.app.on_(DragEvent.DRAG, (e: DragEvent) => {
                if (pen) {
                    const { x, y } = e.getLocalPoint(contentFrame);
                    pen.lineTo(x, y);
                    pen.paint();
                }
            }),
            this.editor.app.on_(DragEvent.END, (e: DragEvent) => {
                if (pen) {
                    this.editor.history.save();
                    pen = null;
                }
            }),
        ];
        this._mode = "draw";
        this.editor.eventBus.emit(EventTypes.changeMode, "draw");
    }

    set(mode: string): void {
        if (mode === "preview") {
            this.setPreview();
        } else if (mode === "normal") {
            this.setNormal();
        } else if (mode === "draw") {
            this.setDraw();
        } else {
            console.warn(`The mode ${mode} is not supported`);
            this.setNormal();
        }
    }

    private _offDrawModeEvents(): void {
        if (!this._drawModeEvents) return;
        this.editor.app.off_(this._drawModeEvents);
        this._drawModeEvents = [];
    }

    destroy(): void {
        this._offDrawModeEvents();
    }
}
