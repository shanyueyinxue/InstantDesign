import { App, MoveEvent, ZoomEvent } from '@leafer-ui/core'
import type { ILeaf } from '@leafer-ui/interface'
import {
    EditorEvent,
    EditorMoveEvent,
    EditorRotateEvent,
    EditorScaleEvent,
} from '@leafer-in/editor'

export const PLUGIN_NAME = 'leafer-x-edit-toolbar'

/**
 * 用户配置
 */
export type IConfig = {
    /**
     * 自定义容器类名
     */
    className?: string

    baseScale?: number // 基础缩放比例 默认 1
    /**
     * 是否跟随缩放
     * @default false
     */
    followScale?: boolean
    /**
     * 是否使用默认样式，如果为 true 可以通过 onRender 实现更特殊的效果
     * 注意：`true` 时，followScale 属性失效
     * @default false
     */
    disableDefaultStyle?: boolean;
    /**
     * 是否显示 toolbar
     */
    shouldShow?: (node: ILeaf) => boolean
    /**
     * 渲染 toolbar 内容
     */
    onRender: (node: ILeaf, container: HTMLDivElement, options: { x: number; y: number }) => void

    /**
     * 隐藏 toolbar 回调; 在 disableDefaultStyle 为 true 时，可以用来实现自定义隐藏逻辑
     */
    hideToolbar?: (container: HTMLDivElement) => boolean
}

export class EditToolbarPlugin {
    /**
     * @param { App } app - leafer app 实例
     * @private
     */
    private readonly app: App

    /**
     * @param { HTMLDivElement } container - toolbar DOM 容器
     * @private
     */
    private container!: HTMLDivElement

    /**
     * @param { IConfig } config - 用户配置
     * @private
     */
    private readonly config: IConfig

    private rafId: number | null = null
    private isHide = false

    constructor(app: App, config: IConfig) {
        this.app = app
        this.config = config

        this.toolbarHandler = this.toolbarHandler.bind(this)

        this.initEvent()
    }

    /**
     * 初始化事件
     */
    private initEvent() {
        // 监听画布选择事件
        this.app.on([MoveEvent.MOVE, ZoomEvent.ZOOM], this.toolbarHandler)
        this.app.editor.on(
            [
                EditorEvent.SELECT,
                EditorMoveEvent.MOVE,
                EditorScaleEvent.SCALE,
                EditorRotateEvent.ROTATE,
            ],
            this.toolbarHandler
        )
    }

    /**
     * 选中事件处理
     */
    private toolbarHandler() {
        const { editor } = this.app
        const node = editor.element
        if (!node) {
            this.hideToolbar()
            return
        }

        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId)
        }
        this.rafId = requestAnimationFrame(async () => {
            this.rafId = null
            await Promise.resolve()
            const { editor } = this.app
            const node = editor.element
            if (!node) {
                this.hideToolbar()
                return
            }
            const isShouldShow = this.config.shouldShow
                ? this.config.shouldShow(node)
                : true
            if (!isShouldShow) {
                this.hideToolbar()
                return
            }
            this.showToolbar(node)
        })
    }

    /**
     * 显示 toolbar
     */
    private showToolbar(node: ILeaf) {
        this.isHide = false
        const { onRender, followScale = false, disableDefaultStyle = false } = this.config;
        // 初始化渲染容器
        if (!this.container) {
            this.initContainer()
        }

        // 计算位置
        let clientX = 0
        let clientY = 0
        // if (this.app.view && this.app.view instanceof HTMLElement) { // 兼容旧版本;每次都获取会不会太耗时？
        //     const { left, top } = this.app.view.getBoundingClientRect()
        //     clientX = left
        //     clientY = top
        // }
        const x = node.worldBoxBounds.x + clientX
        const y = node.worldBoxBounds.y + clientY

        // 触发渲染回调
        if (onRender) {
            onRender(node, this.container, { x, y })
        }

        // 执行默认样式渲染逻辑
        if (!disableDefaultStyle) {
            const { baseScale = 1 } = this.config;
            const style: Partial<CSSStyleDeclaration> = {
                display: 'block',
                left: `${x + node.worldBoxBounds.width / 2}px`,
                top: `${y}px`,
            }
            if (followScale) {
                style.transformOrigin = 'left top'
                style.transform = `scale(${Math.abs(
                    node.worldTransform.scaleX * baseScale,
                )}, ${Math.abs(node.worldTransform.scaleY * baseScale,)}) translate(-50%, -120%)`
            } else {
                style.transform = `scale(${baseScale}, ${baseScale}) ` + 'translate(-50%, -120%)'
            }
            setStyle(this.container, style)
        }
    }

    /**
     * 隐藏 toolbar
     */
    private hideToolbar() {
        if (this.isHide) {
            return
        }
        const { disableDefaultStyle = false, hideToolbar } = this.config;

        if (disableDefaultStyle) {
            if (hideToolbar) {
                this.isHide = hideToolbar(this.container)
            }
        } else {
            setStyle(this.container, {
                display: 'none',
            })
            this.isHide = true
        }
    }

    private get rootNode() {
        // @ts-ignore
        return this.app.view.parentNode ?? document.body;
    }

    private initContainer() {
        const id = `${PLUGIN_NAME}-container`
        const container = this.rootNode.querySelector(`#${id}`)
        if (container && container instanceof HTMLDivElement) {
            this.container = container
            return
        } else if (container) {
            container.parentNode?.removeChild(container)
        }
        const { className } = this.config;
        this.container = document.createElement('div')
        this.rootNode.appendChild(this.container)

        this.container.id = id
        if (className) {
            this.container.classList.add(className)
        }
        setStyle(this.container, {
            pointerEvents: 'auto',
            position: 'absolute',
            whiteSpace: 'nowrap',
        })
    }

    public hide() {
        this.hideToolbar()
    }
    public show() {
        const { editor } = this.app
        const node = editor.element
        if (!node) {
            return
        }
        this.toolbarHandler()
    }

    /**
     * 销毁 toolbar
     */
    public destroy() {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId)
            this.rafId = null
        }
        this.app.off([MoveEvent.MOVE, ZoomEvent.ZOOM], this.toolbarHandler)
        this.app.editor.off(
            [
                EditorEvent.SELECT,
                EditorMoveEvent.MOVE,
                EditorScaleEvent.SCALE,
                EditorRotateEvent.ROTATE,
            ],
            this.toolbarHandler
        )
        // 移除 toolbar
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container)
        }
    }
}

function setStyle(
    element: HTMLElement,
    cssStyles: Partial<CSSStyleDeclaration>
) {
    if (!element) {
        return
    }
    for (const [property, value] of Object.entries(cssStyles)) {
        ; (element.style as any)[property] = value
    }
}
