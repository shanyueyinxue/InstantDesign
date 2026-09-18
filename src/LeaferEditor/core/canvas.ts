import type {
    IExportFileType,
    IExportOptions,
    ILeafer,
    IUI,
} from "@leafer-ui/interface";
import {
    Frame,
    Platform,
} from "leafer-ui";

import { Tag } from "./interfaces";
import { generateID } from "./utils";
import {
    getSiblingZIndexRange,
    recursiveNormalizeZIndexes,
} from "./utils/zIndexTree";

// 平铺的透明方格
const svg = Platform.toURL(
    `<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="5" height="5" fill="#FFF"/><rect x="5" y="0" width="5" height="5" fill="#CCC"/>
<rect x="0" y="5" width="5" height="5" fill="#CCC"/><rect x="5" y="5" width="5" height="5" fill="#FFF"/>
</svg>`, 'svg',)


interface MetaData {
    cover?: string
    title?: string
    author?: string
    description?: string
    [key: string]: any  // 其他自定义元数据
}

// className === NoLayer 的表示该元素不在图层中
export const NoLayer = 'NoLayer';


export class Canvas {
    public readonly name: string

    // 元数据: 用于存储一些额外的数据
    // 例如: 封面、 标题、 作者、 说明等
    public metaData: MetaData = {}

    private _groundFrame: Frame
    private _skyFrame: Frame
    private _contentFrame: Frame

    private _width: number
    private _height: number
    private x: number
    private y: number
    private childrenTotal: number = 0

    constructor(name: string, width: number, height: number, x?: number, y?: number, contentFill?: string, metaData?: MetaData) {
        this.name = name
        this._width = width
        this._height = height
        this.x = x || 0
        this.y = y || 0

        this._groundFrame = this.newGroundFrame()
        this._contentFrame = this.newContentFrame(contentFill)
        this._skyFrame = this.newSkyFrame()

        this.metaData = metaData || {}
    }
    public bindLeafer(leafer: ILeafer) {
        leafer.add(this._groundFrame)
        leafer.add(this._contentFrame)
        leafer.add(this._skyFrame)
    }

    private newContentFrame(contentFill?: string): Frame {
        return new Frame({
            id: generateID(),
            name: this.name,
            x: this.x,
            y: this.y,
            width: this._width,
            height: this._height,
            fill: contentFill || "Transparent",
            blendMode: "normal",
            draggable: false,
            hittable: true,
        })
    }

    private newSkyFrame(): Frame {
        return new Frame({
            id: generateID(),
            name: this.name,
            x: this.x,
            y: this.y,
            width: this._width,
            height: this._height,
            fill: "Transparent",
            hittable: false,
            draggable: false,
            editable: false,
            overflow: "show", // 内容超出显示
            blendMode: "normal",
        })
    }
    private newGroundFrame(): Frame {
        return new Frame({
            id: generateID(),
            name: this.name,
            x: this.x,
            y: this.y,
            width: this._width,
            height: this._height,
            // fill: "Transparent",
            blendMode: "normal",
            fill: {
                type: 'image',
                url: svg,
                mode: 'repeat',
                scaleFixed: true // 固定平铺图比例，不随画布缩放  //
            },
            shadow: {
                x: 0,
                y: 3,
                blur: 15,
                color: '#0009',
                scaleFixed: 'zoom-in' // 固定阴影比例，不随画布放大 //
            },
            hittable: false,
            draggable: false,
        })
    }

    public resize(width: number, height: number) {
        this._width = width
        this._height = height
        // this.contentFrame.width = width
        // this.contentFrame.height = height
        // this.skyFrame.width = width
        // this.skyFrame.height = height
        // this.groundFrame.width = width
        // this.groundFrame.height = height
        this.contentFrame.resizeWidth(width)
        this.contentFrame.resizeHeight(height)
        this.skyFrame.resizeWidth(width)
        this.skyFrame.resizeHeight(height)
        this.groundFrame.resizeWidth(width)
        this.groundFrame.resizeHeight(height)
    }

    public get overflowShow() {
        return this.contentFrame.overflow === 'show'
    }

    public set overflowShow(v: boolean) {
        if (v) {
            this.contentFrame.overflow = 'show'
        } else {
            this.contentFrame.overflow = 'hide'
        }
    }

    public add(child: IUI, index?: number, parent?: IUI) {
        const _childAddAttr = (child: IUI) => {
            this.childrenTotal += 1
            child.id = child.id || generateID()
            child.name = child.name || this.defaultLayerName(child)
            child.zIndex = child.zIndex || 0
            if (child.tag === Tag.Group) {
                child.hitChildren = false // 子元素不可 交互事件
                child.children?.forEach(_childAddAttr)
            }
        }
        _childAddAttr(child)
        // child.proxyData  // 访问 proxyData 后会自动创建响应式数据对象 __proxyData，注意合理使用，会增加内存开销。

        if (parent) {
            const range = getSiblingZIndexRange(parent.children || []);
            child.zIndex = index || range.max + 1
            parent.add(child, index)
        } else {
            const range = getSiblingZIndexRange(this.contentLayers);
            child.zIndex = index || range.max + 1
            this.contentFrame.add(child, index)
        }
    }

    // 替换内容层中的所有元素
    public replaceContent(children: IUI[]): void {
        this.contentFrame.clear();
        children.forEach(child => this.add(child));
    }

    public toJSON(): object {
        recursiveNormalizeZIndexes(this.contentLayers);

        const contentFrame = this.contentFrame.toJSON();
        // const groundFrame = this.groundFrame.toJSON();
        const skyFrame = this.skyFrame.toJSON();

        contentFrame.children = contentFrame.children?.filter(child => child.className !== NoLayer);
        // groundFrame.children = groundFrame.children.filter(child => child.className !== NoLayer);
        // skyFrame.children = skyFrame.children?.filter(child => child.className !== NoLayer);
        return {
            name: this.name,
            width: this._width,
            height: this._height,
            x: this.x,
            y: this.y,
            // groundFrame: this.groundFrame.toJSON(),
            contentFrame,
            skyFrame,
            metaData: this.metaData,
        }
    }
    // exportContentJSON 只导出内容层和元数据的JSON数据，不包括 groundFrame 和 skyFrame 
    public exportContentJSON(): object {
        recursiveNormalizeZIndexes(this.contentLayers);

        const contentFrame = this.contentFrame.toJSON();
        contentFrame.children = contentFrame.children?.filter(child => child.className !== NoLayer);

        return {
            name: this.name,
            width: this._width,
            height: this._height,
            x: this.x,
            y: this.y,
            contentFrame,
            metaData: this.metaData,
        }
    }

    public static fromJSON(json: object): Canvas {
        // @ts-ignore
        const { name, width, height, x, y, groundFrame, contentFrame, skyFrame, metaData } = json
        const canvas = new Canvas(name, width, height, x, y)
        canvas.metaData = metaData
        if (contentFrame)
            canvas.contentFrame.set(contentFrame)
        if (groundFrame)
            canvas.groundFrame.set(groundFrame)
        if (skyFrame) {
            canvas.skyFrame.set(skyFrame)
            const _setSkyAttr = (children: IUI[]) => {
                for (const child of children) {
                    if (child.tag === Tag.Group) {
                        child.hitChildren = false
                        _setSkyAttr(child.children || [])
                    }
                    child.editable = false
                }
            }
            _setSkyAttr(canvas.skyFrame.children)
        }


        const _setContentAttr = (children: IUI[]): number => {
            let total = 0
            for (const child of children) {
                if (child.tag === Tag.Group) {
                    child.hitChildren = false
                    total += _setContentAttr(child.children || [])
                }
                total += 1
            }
            return total
        }
        const layers = canvas.contentLayers;
        canvas.childrenTotal = _setContentAttr(layers)

        const _setinfo = (child: IUI, index: number) => {
            child.id = child.id || generateID()
            child.name = child.name || `${child.tag || 'Layer'} ${index + 1}`
            // child.proxyData  // 访问 proxyData 后会自动创建响应式数据对象 __proxyData，注意合理使用，会增加内存开销。
            if (child.tag === Tag.Group) {
                child.hitChildren = false // 子元素不可 交互事件
            }
            child.children?.forEach(_setinfo)
        }
        layers.forEach(_setinfo)
        canvas.contentFrame.forceRender()
        canvas.skyFrame.forceRender()
        canvas.groundFrame.forceRender()
        return canvas
    }

    public async export(_filename: IExportFileType | string, _options?: IExportOptions | number | boolean) {
        return this.contentFrame.export(_filename, _options)
    }
    public exportSync(_filename: IExportFileType | string, _options?: IExportOptions | number | boolean) {
        return this.contentFrame.syncExport(_filename, _options)
    }

    public async exportContentAndSky(_filename: IExportFileType | string, _options?: IExportOptions | number | boolean) {
        const tempFrame = new Frame({ x: 0, y: 0, width: this._width, height: this._height, fill: "Transparent" })
        tempFrame.add(this.contentFrame.clone())
        tempFrame.add(this.skyFrame.clone())
        try {
            return await tempFrame.export(_filename, _options)
        } finally {
            tempFrame.destroy()
        }
    }
    public exportSyncContentAndSky(_filename: IExportFileType | string, _options?: IExportOptions | number | boolean) {
        const tempFrame = new Frame({ x: 0, y: 0, width: this._width, height: this._height, fill: "Transparent" })
        tempFrame.add(this.contentFrame.clone())
        tempFrame.add(this.skyFrame.clone())
        try {
            return tempFrame.syncExport(_filename, _options)
        } finally {
            tempFrame.destroy()
        }
    }

    public get contentFrame(): Frame {
        if (!this._contentFrame) {
            throw new Error('contentFrame is not initialized')
        }
        return this._contentFrame
    }

    public get skyFrame(): Frame {
        if (!this._skyFrame) {
            throw new Error('skyFrame is not initialized')
        }
        return this._skyFrame
    }

    public get groundFrame(): Frame {
        if (!this._groundFrame) {
            throw new Error('groundFrame is not initialized')
        }
        return this._groundFrame
    }

    public get width() {
        return this._width
    }
    public set width(value: number) {
        this.resize(value, this._height)
    }
    public get height() {
        return this._height
    }
    public set height(value: number) {
        this.resize(this._width, value)
    }

    public get contentLayers(): IUI[] {
        return (this.contentFrame.children || []).filter(child => child.className !== NoLayer)
    }
    // public get contentLayers(): IUI[] {
    //     const filterRecursive = (children: IUI[]): IUI[] => {
    //         return children
    //             .filter(child => child.className !== NoLayer)
    //             .map(child => {
    //                 if (child.children && child.children.length > 0) {
    //                     child.children = filterRecursive(child.children as IUI[]);
    //                 }
    //                 return child;
    //             });
    //     };
    //     return filterRecursive(this.contentFrame.children || []);
    // }


    public defaultLayerName(iui: IUI): string {
        return `${iui.tag || 'Layer'} ${this.childrenTotal}`
    }

    // 销毁
    public destroy() {
        this.skyFrame.destroy()
        this.contentFrame.destroy()
        this.groundFrame.destroy()

        this._width = 0
        this._height = 0
        this.x = 0
        this.y = 0
        this.childrenTotal = 0
    }
}

