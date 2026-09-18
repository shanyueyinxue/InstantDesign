import type { App, Frame, IExportFileType, IExportOptions, IFindCondition, IFindUIMethod, IGroup, IPathInputData, IUI, IZoomType, Image as LeaferImage } from "leafer-ui";

import type { EventTypes, MittBus } from "../events";
import type { Canvas } from "../canvas";
import type { IPluginHost } from "../pluginHost";
import type { FontInfo } from "../managers/FontManager";
import { ImageSourceTag } from "./sourceTag";

export interface EditorCanvasOptions {
    width?: number;
    height?: number;
    fill?: string;
    lockRatio?: boolean | "corner" | undefined;
    /** 是否禁用平移视图交互 */
    disabledMove?: boolean;
    /** 是否禁用 wheel 事件 */
    disabledWheel?: boolean;
    /** 是否开启鼠标滚轮直接缩放 */
    zoomMode?: boolean | 'mouse';
    /** 拖动元素时是否隐藏编辑框 */
    hideOnMove?: boolean;
    /** 画布背景颜色 */
    contentFill?: string;
}

export interface EditorPageOptions {
    /** 切换页面后是否自适应缩放 */
    changePageZoomFit?: boolean;
}

export interface EditorHistoryOptions {
    /** 是否启用历史记录（撤销/重做）。默认 true */
    enabled?: boolean;
    /** 历史记录最大步数。默认 20 */
    maxSize?: number;
}

export interface EditorImageOptions {
    /** 允许的图片文件类型 */
    fileTypes?: string[];
    /** 图片最大尺寸（字节） */
    maxSize?: number;
    /** 图片上传回调，默认使用本地 base64 读取 */
    uploadCallback?: (
        file: File,
        sourceTag: ImageSourceTag,
        image?: IUI
    ) => Promise<{
        url: string,
        width?: number,
        height?: number,
        name?: string,
    }>
}

export interface EditorFontOptions {
    /** JSON 加载时发现本地未注册的字体时调用，返回 FontInfo[] 用于自动注册 */
    onFontsNotFound?: (missingFontNames: string[]) => Promise<FontInfo[]> | FontInfo[]
}

export interface LeaferEditorOptions {
    canvas?: EditorCanvasOptions;
    page?: EditorPageOptions;
    history?: EditorHistoryOptions;
    image?: EditorImageOptions;
    font?: EditorFontOptions;
}

export interface IPageManager {
    readonly current: Canvas;
    readonly currentID: string;
    list(): Canvas[];
    add(id?: string, setCurrent?: boolean, _metaData?: object): string;
    addCanvas(id: string, canvas: Canvas): void;
    setCurrent(id: string): boolean;
    remove(id: string): void;
    next(): void;
    prev(): void;
    has(id: string): boolean;
    clearAll(): void;
    destroy(): void;
    initDefault(): void;
}

export interface IHistoryManager {
    undo(): void;
    redo(): void;
    clear(): void;
    disable(): void;
    enable(): void;
    isEnabled(): boolean;
    save(): void;
    getCurrentState(): any;
    canUndo(): boolean;
    canRedo(): boolean;
    info(): any;
    initForCanvas(canvas: Canvas, maxSize?: number): void;
    removeForCanvas(id: string): void;
    destroy(): void;
}

export interface ILayerManager {
    normalizeZIndexes(array: IUI[]): void;
    recursiveNormalizeZIndexes(array: IUI[]): void;
    printLayers(): void;
    moveUp(ui: IUI): boolean;
    moveDown(ui: IUI): boolean;
    moveToTop(ui: IUI): boolean;
    moveToBottom(ui: IUI): boolean;
    moveIntoGroup(element: IUI, targetGroup: IGroup, index?: number): boolean;
    moveOutOfGroup(element: IUI, index?: number): boolean;
    moveBefore(element: IUI, targetElement: IUI): boolean;
    moveAfter(element: IUI, targetElement: IUI): boolean;
}

export interface IModeManager {
    readonly current: string;
    readonly penStyle: IPathInputData;
    setPreview(): void;
    setNormal(): void;
    setDraw(): void;
    setPenStyle(style?: IPathInputData): void;
    set(mode: string): void;
    destroy(): void;
}

export interface UploadOptions {
    /** 自定义图片来源标签，不传则根据 URL 格式自动判断 Base64/Blob */
    sourceTag?: ImageSourceTag;
    /** 每张图片上传成功后的回调 */
    onUploaded?: (record: { oldUrl: string; newUrl: string; ui: IUI }) => void;
}

export interface IImageManager {
    open(): Promise<LeaferImage>;
    hasLocalImages(): boolean;
    uploadLocalImages(options?: UploadOptions): Promise<void>;
}

export interface IClipboardManager {
    readonly hasItems: boolean;
    copy(selected: IUI[]): void;
    cut(selected: IUI[]): IUI[];
    paste(): IUI[];
    clear(): void;
}

export interface IFontManager {
    readonly fontList: FontInfo[]
    readonly defaultFonts: FontInfo[]
    addCustomFonts(fonts: FontInfo[]): FontInfo[]
    collectFontsFromJSON(json: object): Set<string>
    resolveMissingFonts(json: object): Promise<void>
    waitForFonts(families: Iterable<string>, timeout?: number): Promise<void>
    hasFont(name: string): boolean
    findFontByName(name: string): FontInfo | undefined
    destroy(): void
}

export interface ILeaferEditor extends IPluginHost {
    readonly options: LeaferEditorOptions
    readonly currentScale: number;
    readonly eventBus: MittBus;
    readonly Events: typeof EventTypes;
    readonly app: App;
    readonly view: HTMLElement;
    readonly selected: IUI[];

    readonly canvasWidth: number;
    readonly canvasHeight: number;

    readonly page: IPageManager;
    readonly history: IHistoryManager;
    readonly layer: ILayerManager;
    readonly mode: IModeManager;
    readonly image: IImageManager;
    readonly clipboard: IClipboardManager;
    readonly font: IFontManager;

    clear(): void;
    clearContent(): void;
    clearGround(): void;
    clearSky(): void;
    destroy(): void;

    zoom(type: IZoomType): void;
    zoom(scale: number): void;
    resize(width: number, height: number, _syncCanvasSize?: boolean): void;

    select(target: IUI | IUI[]): void;
    cancel(): void;

    toJSON(): object;
    exportContentJSON(): object;
    reLoadFromJSON(json: object): Promise<boolean>;
    appendPagesFromJSON(json: object): Promise<boolean>;

    canvasResize(width: number, height: number): void;

    add(_child: IUI, _index?: number): void;
    addMany(children: IUI[]): void;
    remove(_child?: string | number | IUI | IFindCondition | IFindUIMethod | undefined, _destroy?: boolean): void;
    removeEmptyGroup(): void;

    group(): boolean;
    ungroup(): void;

    setNormalizeAttr(child: IUI): void;

    export(_filename: string, _options?: number | boolean | IExportOptions | undefined): void;
    exportSync(_filename: IExportFileType | string, _options?: IExportOptions | number | boolean): any;
    exportContentAndSky(_filename: string, _options?: number | boolean | IExportOptions | undefined): void;
    exportSyncContentAndSky(_filename: IExportFileType | string, _options?: IExportOptions | number | boolean): any;
}
