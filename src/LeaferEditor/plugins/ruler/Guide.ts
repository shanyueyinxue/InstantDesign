import { App, Leafer, PointerEvent, LeaferEvent, PropertyEvent } from '@leafer-ui/core'
import { Line, } from "leafer-ui";

import { deepMerge } from './utils'

import { Ruler } from "./Ruler";


export type GuideConfig = {
    enabled: boolean,
    guideLineColor: string,
    guideLineWidth: number,
    guideLineActiveColor: string,
    hitRadius: number,
}

export const defaultConfig: GuideConfig = {
    enabled: true,
    guideLineColor: '#165dff',
    guideLineWidth: 1,
    guideLineActiveColor: '#b20edb',
    hitRadius: 5,
}


const GRID_LINE_OFFSCREEN = -99999999
const GRID_LINE_MAX_WIDTH = 99999999 * 2
const GRID_LINE_Z_INDEX = 999


export class Guide {
    gridLineName = 'GuideLine'
    private app: App
    private ruler: Ruler
    public readonly guideLayer: Leafer

    public config: Required<GuideConfig>

    public _guideLines: Line[] = []
    private _guideId = 0

    constructor(app: App, ruler: Ruler, config?: GuideConfig) {
        this.app = app
        this.ruler = ruler
        this.guideLayer = app.addLeafer()
        // this.guideLayer.hitRadius = 10

        this.config = deepMerge<GuideConfig>(defaultConfig, config || {}) as Required<GuideConfig>
        this.onTreeZoom = this.onTreeZoom.bind(this)
        this.onScale = this.onScale.bind(this)
        this.enabled = !!this.config.enabled
    }
    /** 设置标尺启用/禁用 */
    public set enabled(value: boolean) {
        this.config.enabled = value
        if (value) {
            // 缩放同步/平移同步
            this.app.tree.on([LeaferEvent.TRANSFORM, LeaferEvent.MOVE, LeaferEvent.SCALE, LeaferEvent.ROTATE, LeaferEvent.SKEW], this.onTreeZoom)
            this.app.tree.on(LeaferEvent.SCALE, this.onScale)
        } else {
            // 缩放同步/平移同步
            this.app.tree.off([LeaferEvent.TRANSFORM, LeaferEvent.MOVE, LeaferEvent.SCALE, LeaferEvent.ROTATE, LeaferEvent.SKEW], this.onTreeZoom)
            this.app.tree.off(LeaferEvent.SCALE, this.onScale)
        }
    }


    newGridLine(place: number, direction: 'horizontal' | 'vertical'): Line {
        let rotation = 0
        let x = GRID_LINE_OFFSCREEN
        let y = GRID_LINE_OFFSCREEN
        if (direction === 'horizontal') {
            rotation = 0
            y = place
        } else {
            rotation = 90
            x = place
        }
        const id = this.generateID()
        const line = new Line({
            id,
            className: this.gridLineName,
            name: id,
            width: GRID_LINE_MAX_WIDTH,
            strokeWidth: this.strokeWidth(),
            stroke: this.config.guideLineColor || '#1d1dff',
            rotation,
            x,
            y,
            zIndex: GRID_LINE_Z_INDEX,
            cursor: direction === 'horizontal' ? 'ns-resize' : 'ew-resize',
            draggable: true,
            hitRadius: this.config.hitRadius,
        })
        line.on(PointerEvent.DOWN, (e: PointerEvent) => {
            if (e.buttons !== 1) return
            line.stroke = this.config.guideLineActiveColor || '#b20edb'
            e.stop()
        }, true)

        line.on(PropertyEvent.CHANGE, (e: PropertyEvent) => {
            if (["x", "y"].includes(e.attrName)) {
                // this._onPropertyChange(direction, )
                this.ruler.forceRender() // 强制刷新标尺
                this.guideLayer.forceRender() // 强制刷新标尺
            }
        })

        line.on(PointerEvent.UP, (e: PointerEvent) => {
            if (e.buttons !== 1) return
            line.stroke = this.config.guideLineColor || '#1d1dff'
            const local = e.getLocalPoint(this.app)
            if (this.ruler.willDelete(local)) {
                this._guideLines = this._guideLines.filter(l => l.id !== line.id) // 移除已删除的线
                line.remove()
                line.destroy()
            }
            // 将xy取整
            line.x = Math.round(line.x || 0)
            line.y = Math.round(line.y || 0)
            this.ruler.forceRender() // 强制刷新标尺        
        })
        return line
    }

    addGuideLine(type: 'horizontal' | 'vertical', position: number): void {
        const line = this.newGridLine(position, type)
        this._guideLines.push(line)
        this.guideLayer.add(line)
        this.ruler.forceRender() // 强制刷新标尺        
    }

    add(line: Line): void {
        this._guideLines.push(line)
        this.guideLayer.add(line)
        this.ruler.forceRender() // 强制刷新标尺        
    }

    get guideLines(): Line[] {
        return [...this._guideLines]
    }
    get horizontalGuideLines(): Line[] {
        return this.guideLines.filter(line => line.rotation === 0)
    }
    get verticalGuideLines(): Line[] {
        return this.guideLines.filter(line => line.rotation === 90)
    }

    set guideLines(guideLines: Line[]) {
        this._guideLines = guideLines
        this.guideLayer.clear()
        guideLines.forEach(line => {
            line.strokeWidth = this.strokeWidth()
            this.guideLayer.add(line)
        })
        this.ruler.resize()
    }

    clearAllGuideLines(destroy?: boolean) {
        this._guideLines.forEach(line => {
            line.remove()
            if (destroy) {
                line.destroy()
            }
        })
        this._guideLines = []
        this.ruler.resize()
    }

    removeGuideLine(line: Line): void {
        this._guideLines = this._guideLines.filter(l => l.id !== line.id)
        line.remove()
        line.destroy()
        this.ruler.resize()
    }

    show() {
        this._guideLines.forEach(line => {
            line.visible = true
        })
        this.ruler.forceRender() // 强制刷新标尺        
    }
    hide() {
        this._guideLines.forEach(line => {
            line.visible = false
        })
        this.ruler.forceRender() // 强制刷新标尺        
    }

    private generateID() {
        this._guideId++
        return `GuideLine-${this._guideId}`
    }

    private strokeWidth() {
        let scale = this.app.tree.zoomLayer.scale
        if (!(typeof scale === 'number')) scale = 1
        return this.config.guideLineWidth / scale
    }

    private onTreeZoom() {
        const treeZoom = this.app.tree.zoomLayer
        this.guideLayer.zoomLayer.scale = treeZoom.scale
        this.guideLayer.zoomLayer.x = treeZoom.x
        this.guideLayer.zoomLayer.y = treeZoom.y
        this.guideLayer.zoomLayer.rotation = treeZoom.rotation
        this.guideLayer.zoomLayer.skewX = treeZoom.skewX
        this.guideLayer.zoomLayer.skewY = treeZoom.skewY
    }

    private onScale() {
        this._guideLines.forEach(line => {
            line.strokeWidth = this.strokeWidth()
        })
    }

    /** 销毁标尺，释放所有资源 */
    public dispose(): void {
        this.clearAllGuideLines(true)
        this.guideLayer.destroy()
        this.enabled = false
    }
}
