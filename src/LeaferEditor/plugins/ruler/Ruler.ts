import type { ICanvasContext2D, IPointData, IUI } from '@leafer-ui/interface'
import { App, LayoutEvent, Leafer, ResizeEvent, PointerEvent, RenderEvent } from '@leafer-ui/core'
import { EditorEvent } from '@leafer-in/editor'
import { Line, } from "leafer-ui";

import { deepMerge } from './utils'
import { Guide, defaultConfig as guideDefaultConfig, type GuideConfig } from "./Guide";

type TAxis = 'x' | 'y';
type Rect = { left: number; top: number; width: number; height: number }

const PiBy180 = Math.PI / 180

export interface ThemeOption {
  /**
   * 背景颜色
   */
  backgroundColor: string

  /**
   * 文字颜色
   */
  textColor: string

  /**
   * 边框颜色
   */
  borderColor: string

  /**
   * 高亮颜色
   */
  highlightColor: string

  /**
   * 坐标标签文字颜色
   */
  highlightCoordColor?: string

  /**
   * 坐标标签背景色
   */
  highlightCoordBgColor?: string
}

export interface ConversionFactor {
  /**
   * 自定义单位对应的像素数，比如英寸单位：1英寸对应96px，那这里就是96
   */
  px: number

  /**
   * 缩放倍率，对应缩放比例：[0.02, 0.03, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
   */
  gaps: number[]

  /**
   * 默认缩放倍率（如果没有匹配到缩放比例对应的倍率，则使用默认值defaultGap）
   */
  defaultGap: number
}

const DEFAULT_CONVERSION_FACTORS: ConversionFactor = {
  px: 1, // 像素
  gaps: [5000, 2500, 1000, 500, 200, 100, 50, 20, 10], // 缩放基准间隔
  defaultGap: 10000 // 默认缩放基准间隔
}

export interface RulerOptions {
  ruleSize?: number; // 标尺宽高
  fontSize?: number; // 字体大小
  themes?: { [key: string]: ThemeOption } // 主题，默认存在明亮、暗黑主题
  conversionFactors?: { [key: string]: ConversionFactor }; // 定义单位转换因子 (每单位对应的像素数)
  showHighlightCoords?: boolean; // 是否在高亮区域两端显示坐标
  guide: GuideConfig
}

export interface RulerConfig extends RulerOptions {
  /**
   * 是否启用标尺线
   */
  enabled?: boolean
  /**
   * 标尺线主题
   */
  theme?: string

  /**
   * 标尺单位
   */
  unit?: string;
}

export type HighlightRect = {
  skip?: TAxis
} & Rect

interface GuideLineData {
  id: string
  type: 'horizontal' | 'vertical'
  position: number
}

export function buildDefaultConversionFactors(dpi: number = 96): { [key: string]: ConversionFactor } {
  return {
    px: {
      px: 1,
      gaps: [5000, 2500, 1000, 500, 200, 100, 50, 20, 10],
      defaultGap: 10000
    },
    in: {
      px: dpi,
      gaps: [100, 50, 30, 20, 6, 1, 2, 0.8, 0.5],
      defaultGap: 1000
    },
    cm: {
      px: dpi / 2.54,
      gaps: [100, 50, 30, 20, 6, 4, 2, 1, 0.5],
      defaultGap: 1000
    },
    mm: {
      px: dpi / 25.4,
      gaps: [1000, 500, 200, 100, 50, 20, 10, 5, 2],
      defaultGap: 2000
    },
    pt: {
      px: dpi / 72,
      gaps: [5000, 2500, 1000, 500, 200, 100, 50, 20, 10],
      defaultGap: 10000
    },
    pc: {
      px: dpi / 6,
      gaps: [100, 80, 50, 30, 15, 12, 8, 6, 4],
      defaultGap: 1000
    }
  }
}

export const defaultConfig: RulerConfig = {
  enabled: true,
  theme: 'light',
  ruleSize: 20,
  fontSize: 10,
  unit: 'px',
  showHighlightCoords: true,
  themes: {
    light: {
      backgroundColor: '#fff',
      textColor: '#444',
      borderColor: '#ccc',
      highlightColor: '#165dff3b',
      highlightCoordColor: '#fff',
      highlightCoordBgColor: '#165dff'
    },
    dark: {
      backgroundColor: '#242424',
      textColor: '#ddd',
      borderColor: '#555',
      highlightColor: 'rgba(22,93,255,0.55)',
      highlightCoordColor: '#fff',
      highlightCoordBgColor: '#165dff'
    }
  },
  conversionFactors: buildDefaultConversionFactors(),
  guide: guideDefaultConfig
}

export class Ruler {

  private app: App
  public readonly guide: Guide
  private draggingGuideLine: Line | null = null
  private draggingDirection: 'horizontal' | 'vertical' | null = null

  public readonly rulerLeafer: Leafer
  private readonly contextContainer: ICanvasContext2D

  public config: Required<RulerConfig>

  /**
   * 选取对象矩形坐标
   */
  private objectRect:
    | undefined
    | {
      x: HighlightRect[]
      y: HighlightRect[]
    }

  private savedBoxSelect: boolean | "hit" | "includes" | undefined = undefined
  private originalCursor: any = null

  /**
   * 创建 Ruler 实例
   * @param app - Leafer App 实例
   * @param config - 标尺配置选项
   */
  constructor(app: App, config?: RulerConfig) {
    this.app = app
    this.guide = new Guide(app, this, config?.guide)

    this.rulerLeafer = app.addLeafer()
    this.contextContainer = this.rulerLeafer.canvas.context

    this.config = deepMerge<RulerConfig>(defaultConfig, config || {}) as Required<RulerConfig>

    this.forceRender = this.forceRender.bind(this)
    this.resize = this.resize.bind(this)
    this.onPointerDown = this.onPointerDown.bind(this)
    this.onPointerMove = this.onPointerMove.bind(this)
    this.onPointerUp = this.onPointerUp.bind(this)
    this.enabled = !!this.config.enabled
  }

  /** 标尺主题 */
  public set theme(value: string) {
    this.config.theme = value
    this.forceRender()
  }

  public get theme() {
    return this.config.theme!
  }

  /**
   * 添加主题
   * @param key
   * @param theme
   */
  public addTheme(key: string, theme: ThemeOption) {
    this.config.themes![key] = theme
  }

  /**
   * 删除主题
   * @param key
   */
  public removeTheme(key: string) {
    delete this.config.themes![key]
  }


  /**
   * 切换主题
   * @param value - 主题 key
   */
  public changeTheme(value: string) {
    this.theme = value
  }

  /**
   * 添加单位
   * @param key
   * @param conversionFactor
   */
  public addUnit(key: string, conversionFactor: ConversionFactor) {
    this.config.conversionFactors![key] = conversionFactor
  }

  /**
   * 删除单位
   * @param key
   */
  public removeUnit(key: string) {
    delete this.config.conversionFactors![key]
  }

  /**
   * 切换标尺单位
   * @param unit - 单位 key（如 px、cm、mm、in、pt、pc）
   */
  public changeUnit(unit: string) {
    this.config.unit = unit
    this.forceRender()
  }

  /**
   * 切换启用/禁用标尺
   * @param value - 是否启用
   */
  public changeEnabled(value: boolean) {
    this.enabled = value
  }

  /** 获取标尺是否启用 */
  public get enabled() {
    return !!this.config.enabled
  }

  /** 设置标尺启用/禁用 */
  public set enabled(value: boolean) {
    this.config.enabled = value
    if (value) {
      this.app.tree.on(LayoutEvent.AFTER, this.forceRender)
      this.app.tree.on(ResizeEvent.RESIZE, this.resize)
      this.app.editor?.on(EditorEvent.SELECT, this.forceRender)
      this.app.on(PointerEvent.DOWN, this.onPointerDown)
      this.app.on(PointerEvent.MOVE, this.onPointerMove)
      this.app.on(PointerEvent.UP, this.onPointerUp)

      this.resize()
    } else {
      this.app.tree.off(LayoutEvent.AFTER, this.forceRender)
      this.app.tree.off(ResizeEvent.RESIZE, this.resize)
      this.app.editor?.off(EditorEvent.SELECT, this.forceRender)
      this.app.off(PointerEvent.DOWN, this.onPointerDown)
      this.app.off(PointerEvent.MOVE, this.onPointerMove)
      this.app.off(PointerEvent.UP, this.onPointerUp)

      this.rulerLeafer.forceRender()
    }
  }

  /** 强制刷新标尺渲染 */
  private _renderPending = false
  public forceRender() {
    if (this._renderPending || !this.enabled) return
    this._renderPending = true
    requestAnimationFrame(() => {
      this._renderPending = false
      if (!this.enabled) return
      this.render({ ctx: this.contextContainer })
      this.renderGuideLineMarks()
    })
  }

  private _resizeTimer: number | null = null
  /** 响应窗口 resize 事件，延迟重新渲染标尺 */
  public resize() {
    if (this._resizeTimer !== null) clearTimeout(this._resizeTimer)
    this._resizeTimer = window.setTimeout(() => {
      this._resizeTimer = null
      if (this.enabled) {
        this.render({ ctx: this.contextContainer })
        this.renderGuideLineMarks()
      }
    }, 100)
  }

  /**
   * 获取画板尺寸
   */
  private getSize() {
    return {
      width: this.app.width || 0,
      height: this.app.height || 0
    }
  }

  private getTheme(): ThemeOption {
    return this.config.themes[this.config.theme] ?? this.config.themes['light']!
  }

  private render({ ctx }: { ctx: ICanvasContext2D }) {
    this.rulerLeafer.canvas.setWorld({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })

    const { worldTransform } = this.app.tree
    const vpt = [worldTransform.a, worldTransform.b, worldTransform.c, worldTransform.d, worldTransform.e, worldTransform.f]
    const unit = this.config.unit || 'px'
    const ruleSize = this.config.ruleSize ?? 20
    const themeOption = this.getTheme()
    const { width, height } = this.getSize()

    this.calcObjectRect()

    this.draw({
      ctx,
      isHorizontal: true,
      rulerLength: width,
      startCalibration: -(vpt[4]! / vpt[0]!),
      unit
    })
    this.draw({
      ctx,
      isHorizontal: false,
      rulerLength: height,
      startCalibration: -(vpt[5]! / vpt[3]!),
      unit
    })

    this.drawRect(ctx, {
      left: 0,
      top: 0,
      width: ruleSize,
      height: ruleSize,
      fill: themeOption.backgroundColor,
      stroke: themeOption.borderColor
    })

    this.drawText(ctx, {
      text: unit,
      left: ruleSize / 2,
      top: ruleSize / 2,
      align: 'center',
      baseline: 'middle',
      fill: themeOption.textColor
    })

    // this.app.tree.forceRender(undefined, true)
    // TODO 待官方支持手动触发app canvas渲染的方法后替换下面方法
    // 临时先这么用，不然拖动frame时标尺层画布渲染会有延迟
    this.app.tree.emit(RenderEvent.END, { renderBounds: this.app.tree.canvas.bounds })
  }

  private draw(opt: {
    ctx: ICanvasContext2D
    isHorizontal: boolean
    rulerLength: number
    startCalibration: number
    unit: string
  }) {
    const { ctx, isHorizontal, rulerLength, startCalibration, unit } = opt
    const zoom = this.getZoom()
    const gapInPx = this.getGap(zoom, unit)
    const unitLength = Math.ceil(rulerLength / zoom)
    const startValue = Math.floor(startCalibration / gapInPx) * gapInPx
    const startOffset = startValue - startCalibration
    const canvasSize = this.getSize()

    const themeOption = this.getTheme()
    const ruleSize = this.config.ruleSize ?? 20
    const padding = 2.5

    this.drawRect(ctx, {
      left: 0,
      top: 0,
      width: isHorizontal ? canvasSize.width : ruleSize,
      height: isHorizontal ? ruleSize : canvasSize.height,
      fill: themeOption.backgroundColor,
      stroke: themeOption.borderColor
    })

    // 标尺刻度线显示
    for (let pos = 0; pos + startOffset <= unitLength; pos += gapInPx) {
      for (let index = 0; index < 10; index++) {
        const position = Math.round((startOffset + pos + (gapInPx * index) / 10) * zoom)
        const isMajorLine = index === 0
        const [left, top] = isHorizontal
          ? [position, isMajorLine ? 0 : ruleSize - 8]
          : [isMajorLine ? 0 : ruleSize - 8, position]
        const [width, height] = isHorizontal ? [0, ruleSize - top] : [ruleSize - left, 0]
        this.drawLine(ctx, {
          left,
          top,
          width,
          height,
          stroke: themeOption.borderColor
        })
      }
    }

    // 标尺文字显示
    for (let pos = 0; pos + startOffset <= unitLength; pos += gapInPx) {
      const position = (startOffset + pos) * zoom
      const textValue = (startValue + pos) / this.convertUnitsToPx(1, unit)

      const [left, top, angle] = isHorizontal
        ? [position + 6, padding, 0]
        : [padding, position - 6, -90]

      this.drawText(ctx, {
        text: `${Number(textValue.toFixed(2))}`,
        left,
        top,
        fill: themeOption.textColor,
        angle
      })
    }

    // 标尺蓝色遮罩
    if (this.objectRect) {
      const axis = isHorizontal ? 'x' : 'y'
      this.objectRect[axis].forEach((rect) => {
        // 跳过指定矩形
        if (rect.skip === axis) {
          return
        }
        // TODO
        const [left, top, width, height] = isHorizontal
          ? [(rect.left - startCalibration) * zoom, 0, rect.width * zoom, ruleSize]
          : [0, (rect.top - startCalibration) * zoom, ruleSize, rect.height * zoom]

        // 高亮遮罩
        this.drawRect(ctx, {
          left,
          top,
          width,
          height,
          fill: themeOption.highlightColor
        })

        // 绘制坐标标签
        if (this.config.showHighlightCoords) {
          const startCoord = isHorizontal ? rect.left : rect.top
          const endCoord = isHorizontal ? rect.left + rect.width : rect.top + rect.height

          this.drawCoordWithFeather(ctx, {
            isHorizontal,
            coordValue: startCoord / this.convertUnitsToPx(1, unit),
            canvasPos: (startCoord - startCalibration) * zoom,
            ruleSize,
            themeOption
          })

          if ((isHorizontal ? rect.width : rect.height) > 0) {
            this.drawCoordWithFeather(ctx, {
              isHorizontal,
              coordValue: endCoord / this.convertUnitsToPx(1, unit),
              canvasPos: (endCoord - startCalibration) * zoom,
              ruleSize,
              themeOption
            })
          }
        }
      })
    }
    // draw end
  }


  private getGap(zoom: number, unit: string): number {
    // const unitConfig = this.config.conversionFactors![unit] || DEFAULT_CONVERSION_FACTORS
    // const gaps = unitConfig.gaps
    // const base = unitConfig.px
    // const defaultGap = unitConfig.defaultGap

    // const logZoom = Math.log10(zoom)
    // const index = Math.round((logZoom + 1.7) / 0.115)
    // const clampedIdx = Math.max(0, Math.min(index, gaps.length - 1))
    // return (gaps[clampedIdx] ?? defaultGap) * base

    // 获取当前单位对应的基准间隔倍率
    const gaps = this.config.conversionFactors![unit]!.gaps || DEFAULT_CONVERSION_FACTORS.gaps
    const base = this.config.conversionFactors![unit]!.px || DEFAULT_CONVERSION_FACTORS.px

    // 定义缩放比例数组
    const zooms = [0.02, 0.03, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
    let i = 0
    while (i < zooms.length && zooms[i]! < zoom) {
      i++
    }
    return gaps[i - 1]! * base || this.config.conversionFactors![unit]!.defaultGap * base // 如果没有匹配到，返回默认值defaultGap


  }
  private convertUnitsToPx(value: number, toUnit: string): number {
    return value * (this.config.conversionFactors[toUnit]?.px || DEFAULT_CONVERSION_FACTORS.px)
  }

  private drawRect(
    ctx: ICanvasContext2D,
    {
      left,
      top,
      width,
      height,
      fill,
      stroke,
      strokeWidth
    }: {
      left: number
      top: number
      width: number
      height: number
      fill?: string | CanvasGradient | CanvasPattern
      stroke?: string
      strokeWidth?: number
    }
  ) {
    ctx.save()
    ctx.beginPath()
    fill && (ctx.fillStyle = fill)
    ctx.rect(left, top, width, height)
    ctx.fill()
    if (stroke) {
      ctx.strokeStyle = stroke
      ctx.lineWidth = strokeWidth ?? 1
      ctx.stroke()
    }
    ctx.restore()
  }

  private drawText(
    ctx: ICanvasContext2D,
    {
      left,
      top,
      text,
      fill,
      align,
      angle,
      fontSize,
      baseline
    }: {
      left: number
      top: number
      text: string
      fill?: string | CanvasGradient | CanvasPattern
      align?: CanvasTextAlign
      baseline?: CanvasTextBaseline
      angle?: number
      fontSize?: number
    }
  ) {
    ctx.save()
    fill && (ctx.fillStyle = fill)
    ctx.textAlign = align ?? 'left'
    ctx.textBaseline = baseline ?? 'top'
    ctx.font = `${fontSize ?? 12}px Helvetica`
    if (angle) {
      ctx.translate(left, top)
      ctx.rotate(PiBy180 * angle)
      ctx.translate(-left, -top)
    }
    ctx.fillText(text, left, top)
    ctx.restore()
  }

  private drawLine(
    ctx: ICanvasContext2D,
    {
      left,
      top,
      width,
      height,
      stroke,
      lineWidth
    }: {
      left: number
      top: number
      width: number
      height: number
      stroke?: string | CanvasGradient | CanvasPattern
      lineWidth?: number
    }
  ) {
    ctx.save()
    ctx.beginPath()
    stroke && (ctx.strokeStyle = stroke)
    ctx.lineWidth = lineWidth ?? 1
    ctx.moveTo(left, top)
    ctx.lineTo(left + width, top + height)
    ctx.stroke()
    ctx.restore()
  }

  private drawCoordWithFeather(
    ctx: ICanvasContext2D,
    {
      isHorizontal,
      coordValue,
      canvasPos,
      ruleSize,
      themeOption
    }: {
      isHorizontal: boolean
      coordValue: number
      canvasPos: number
      ruleSize: number
      themeOption: ThemeOption
    }
  ) {
    const text = `${Math.round(coordValue)}`
    const fontSize = this.config.fontSize || 10
    const coordColor = themeOption.highlightCoordColor || themeOption.textColor
    const coordBgColor = themeOption.highlightCoordBgColor || themeOption.highlightColor

    ctx.save()
    ctx.font = `${fontSize}px Helvetica`
    const textWidth = ctx.measureText(text).width
    const textHeight = fontSize

    const paddingX = 4
    const paddingY = 2
    const bgWidth = textWidth + paddingX * 2
    const bgHeight = textHeight + paddingY * 2
    const radius = 3

    let bgLeft: number, bgTop: number

    if (isHorizontal) {
      bgLeft = canvasPos - bgWidth / 2
      bgTop = (ruleSize - bgHeight) / 2
    } else {
      ctx.translate(ruleSize / 2, canvasPos)
      ctx.rotate(-90 * PiBy180)
      bgLeft = -bgWidth / 2
      bgTop = -bgHeight / 2
    }

    ctx.shadowBlur = 3
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'

    ctx.beginPath()
    ctx.moveTo(bgLeft + radius, bgTop)
    ctx.lineTo(bgLeft + bgWidth - radius, bgTop)
    ctx.arcTo(bgLeft + bgWidth, bgTop, bgLeft + bgWidth, bgTop + radius, radius)
    ctx.lineTo(bgLeft + bgWidth, bgTop + bgHeight - radius)
    ctx.arcTo(bgLeft + bgWidth, bgTop + bgHeight, bgLeft + bgWidth - radius, bgTop + bgHeight, radius)
    ctx.lineTo(bgLeft + radius, bgTop + bgHeight)
    ctx.arcTo(bgLeft, bgTop + bgHeight, bgLeft, bgTop + bgHeight - radius, radius)
    ctx.lineTo(bgLeft, bgTop + radius)
    ctx.arcTo(bgLeft, bgTop, bgLeft + radius, bgTop, radius)
    ctx.closePath()
    ctx.fillStyle = coordBgColor
    ctx.fill()

    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'

    ctx.fillStyle = coordColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, bgLeft + bgWidth / 2, bgTop + bgHeight / 2)
    ctx.restore()
  }

  private calcObjectRect() {
    const activeObjects = this.app.editor?.list || []
    if (activeObjects.length === 0) {
      this.objectRect = undefined
      return
    }

    const allRect = activeObjects.reduce((rects: HighlightRect[], obj: IUI) => {
      const bounds = obj.getBounds('box', this.app.tree)
      const rect: HighlightRect = { left: bounds.x, top: bounds.y, width: bounds.width, height: bounds.height }
      rects.push(rect)
      return rects
    }, [] as HighlightRect[])
    if (allRect.length === 0) return
    this.objectRect = {
      x: this.mergeLines(allRect, true),
      y: this.mergeLines(allRect, false)
    }
  }

  private mergeLines(rect: Rect[], isHorizontal: boolean) {
    const axis = isHorizontal ? 'left' : 'top'
    const length = isHorizontal ? 'width' : 'height'
    // 先按照 axis 的大小排序
    rect.sort((a, b) => a[axis] - b[axis])
    const mergedLines = []
    let currentLine = Object.assign({}, rect[0])
    for (let i = 1; i < rect.length; i++) {
      const line = Object.assign({}, rect[i])
      if (currentLine[axis] + currentLine[length] >= line[axis]) {
        // 当前线段和下一个线段相交，合并宽度
        currentLine[length] =
          Math.max(currentLine[axis] + currentLine[length], line[axis] + line[length]) -
          currentLine[axis]
      } else {
        // 当前线段和下一个线段不相交，将当前线段加入结果数组中，并更新当前线段为下一个线段
        mergedLines.push(currentLine)
        currentLine = Object.assign({}, line)
      }
    }
    // 加入数组
    mergedLines.push(currentLine)
    return mergedLines
  }

  /** 获取当前画布缩放比例 */
  public getZoom(): number {
    if (this.app.tree) {
      if (typeof this.app.tree.scale === 'number') {
        return this.app.tree.scale
      } else {
        return 1
      }
    } else {
      return 1
    }
  }

  willDelete(point: IPointData): boolean {
    if (!this.draggingDirection) return false
    const ruleSize = this.config.ruleSize || 20
    const position = this.draggingDirection === 'horizontal' ? 'y' : 'x'
    const { width, height } = this.getSize()
    return point[position] < ruleSize || point[position] < 0 ||
      (this.draggingDirection === 'horizontal' ? point[position] > height : point[position] > width)
  }

  private renderGuideLineMarks() {
    const ctx = this.contextContainer
    const ruleSize = this.config.ruleSize ?? 20
    const themeOption = this.getTheme()
    const unit = this.config.unit || 'px'

    const { worldTransform } = this.app.tree
    const scaleX = worldTransform.a
    const scaleY = worldTransform.d
    const translateX = worldTransform.e
    const translateY = worldTransform.f

    const screenToWorldX = (sx: number) => (sx - translateX) / scaleX
    const screenToWorldY = (sy: number) => (sy - translateY) / scaleY

    this.guide.guideLines.forEach((line) => {
      if (!line.visible) return
      const type = line.rotation === 90 ? 'vertical' : 'horizontal'
      const lx = line.x ?? 0
      const ly = line.y ?? 0
      const { x, y } = this.worldToScreen(lx, ly)
      if (type === 'vertical') {
        this.drawCoordWithFeather(ctx, {
          isHorizontal: true,
          coordValue: screenToWorldX(x) / this.convertUnitsToPx(1, unit),
          canvasPos: x,
          ruleSize,
          themeOption
        })
      } else {
        this.drawCoordWithFeather(ctx, {
          isHorizontal: false,
          coordValue: screenToWorldY(y) / this.convertUnitsToPx(1, unit),
          canvasPos: y,
          ruleSize,
          themeOption
        })
      }
    })
  }

  private worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    const { worldTransform } = this.app.tree
    return {
      x: worldX * worldTransform.a + worldTransform.e,
      y: worldY * worldTransform.d + worldTransform.f
    }
  }

  private isInRulerArea(screenX: number, screenY: number): { horizontal: boolean; vertical: boolean } {
    const ruleSize = this.config.ruleSize
    return {
      horizontal: screenY < ruleSize && screenX > ruleSize,
      vertical: screenX < ruleSize && screenY > ruleSize
    }
  }

  private isInCanvasArea(screenX: number, screenY: number): boolean {
    const ruleSize = this.config.ruleSize
    const { width, height } = this.getSize()
    return screenX > ruleSize && screenX < width && screenY > ruleSize && screenY < height
  }

  private onPointerDown(event: any) {
    // if (!this.config.guideLine) return
    const point = event.getPagePoint()
    // const { x, y } = this.worldToScreen(event.x, event.y)
    const { horizontal, vertical } = this.isInRulerArea(event.x, event.y)
    if (!horizontal && !vertical) return

    this.disableBoxSelect()
    const type = horizontal ? 'horizontal' : 'vertical'
    this.setCursor(type === 'horizontal' ? 'ns-resize' : 'ew-resize')
    this.draggingDirection = type
    this.draggingGuideLine = this.guide.newGridLine(horizontal ? point.x : point.y, type)
    this.guide.add(this.draggingGuideLine)
    const position = this.draggingDirection === 'horizontal' ? 'y' : 'x'
    this.draggingGuideLine[position] = point[position]
  }

  private onPointerMove(event: any) {
    const point = event.getPagePoint()
    const { horizontal, vertical } = this.isInRulerArea(event.x, event.y)
    if (!horizontal && !vertical && !this.draggingGuideLine) {
      this.resetCursor()
      return
    }

    if (horizontal) {
      this.setCursor('ns-resize')
    } else if (vertical) {
      this.setCursor('ew-resize')
    }

    if (this.draggingGuideLine) {
      const position = this.draggingDirection === 'horizontal' ? 'y' : 'x'
      this.draggingGuideLine[position] = point[position]
      this.forceRender()
    }
  }

  private onPointerUp(event: any) {
    if (this.draggingGuideLine) {
      const point = event.getLocalPoint()
      if (this.willDelete(point)) {
        this.draggingGuideLine.remove()
        this.draggingGuideLine.destroy()
      }
    }
    this.draggingGuideLine = null
    this.resetCursor()
    this.restoreBoxSelect()
  }

  private setCursor(cursor: string) {
    if (this.originalCursor === null) {
      this.originalCursor = this.app.cursor || ''
    }
    this.app.cursor = cursor as any
  }

  private resetCursor() {
    if (this.originalCursor === null) return
    this.app.cursor = (this.originalCursor || '') as any
    this.originalCursor = null
  }

  private disableBoxSelect() {
    if (this.savedBoxSelect !== undefined) return
    this.savedBoxSelect = this.app.editor?.config.boxSelect
    if (this.app.editor) {
      this.app.editor.cancel()
      this.app.editor.config.boxSelect = false
    }
  }

  private restoreBoxSelect() {
    if (this.savedBoxSelect !== undefined && this.app.editor) {
      this.app.editor.config.boxSelect = this.savedBoxSelect
      this.savedBoxSelect = undefined
    }
  }

  /** 销毁标尺，释放所有资源 */
  public dispose(): void {
    this.guide.dispose()
    this.resetCursor()
    this.restoreBoxSelect()
    this.rulerLeafer.destroy()
    this.enabled = false
  }
}
