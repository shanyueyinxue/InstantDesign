import type { IUI, IFindCondition, IFindUIMethod } from "@leafer-ui/interface"
import type { PropertyEvent } from "leafer-ui";

type PageParam = {
    oldId: string,
    newId: string,
}
type currentState = any

export enum EventTypes {
    pageAddBefore = "pageAddBefore",
    pageAddAfter = "pageAddAfter",
    pageChangeBefore = "pageChangeBefore",
    pageChangeAfter = "pageChangeAfter",
    pageRemoveBefore = "pageRemoveBefore",
    pageRemoveAfter = "pageRemoveAfter",

    canvasAddBefore = "canvasAddBefore",
    canvasAddAfter = "canvasAddAfter",
    canvasChange = "canvasChange",
    canvasResize = "canvasResize",
    canvasRemoveBefore = "canvasRemoveBefore",
    canvasRemoveAfter = "canvasRemoveAfter",

    selectedBefore = "selectedBefore",
    selected = "selected",
    cancelSelected = "cancelSelected",
    canvasZoomChange = "canvasZoomChange",

    changeMode = "changeMode",
    undoRedoStackChange = "undoRedoStackChange",
    historyStateSavedAfter = "historyStateSavedAfter",

    loadBefore = "loadBefore",
    loadAfter = "loadAfter",

    imageLocalUploadSuccess = "imageLocalUploadSuccess",
    imageLocalUploadError = "imageLocalUploadError",
}

export type EventsParam = {
    [EventTypes.pageAddBefore]: PageParam,
    [EventTypes.pageAddAfter]: PageParam,
    [EventTypes.pageChangeBefore]: PageParam,
    [EventTypes.pageChangeAfter]: PageParam,
    [EventTypes.pageRemoveBefore]: string,
    [EventTypes.pageRemoveAfter]: string,

    [EventTypes.canvasAddBefore]: { _child: IUI[], _index?: number },
    [EventTypes.canvasAddAfter]: { _child: IUI[], _index?: number },
    [EventTypes.canvasChange]: PropertyEvent,
    [EventTypes.canvasResize]: { width: number, height: number },
    [EventTypes.canvasRemoveBefore]: { _child?: string | number | IUI | IFindCondition | IFindUIMethod | undefined, _destroy?: boolean },
    [EventTypes.canvasRemoveAfter]: { _child?: string | number | IUI | IFindCondition | IFindUIMethod | undefined, _destroy?: boolean },

    [EventTypes.selectedBefore]: IUI[],
    [EventTypes.selected]: IUI[],
    [EventTypes.cancelSelected]: void | undefined | null,
    [EventTypes.canvasZoomChange]: number,

    [EventTypes.changeMode]: string,
    [EventTypes.undoRedoStackChange]: currentState,
    [EventTypes.historyStateSavedAfter]: { state: currentState, pageId: string },

    [EventTypes.loadBefore]: { json: any },
    [EventTypes.loadAfter]: { json: any },

    [EventTypes.imageLocalUploadSuccess]: { url: string, newUrl: string },
    [EventTypes.imageLocalUploadError]: { url: string, error: Error },
}

export type EventType = keyof EventsParam;
