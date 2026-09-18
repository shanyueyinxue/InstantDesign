import type { PointerEvent, Line, Image } from "leafer-ui";
import type { ILeaf } from "@leafer-ui/interface";
import type { IService } from "../core/pluginHost";

// ============================================================================
// 插件 Options 类型
// ============================================================================

export interface EditorRulerOptions {
    enabled?: boolean;
    unit?: string;
    dpi?: number; // 只是控制标尺单位的显示，不控制标尺的物理单位
    gridLine?: {
        strokeColor?: string;
        strokeDragColor?: string;
    }
}

// ============================================================================
// 菜单项类型
// ============================================================================
//  * 菜单项类型，用于 ContextMenuPluginService 的菜单注册
//  */
export type MenuType = 'ALL' | 'ONE' | 'SOME' | 'ZERO'

/**
 * 菜单项配置接口
 */
export interface MenuOptions {
    /** 菜单项唯一标识 */
    key: string
    /** 菜单项名称 */
    title: string
    /** 适用场景：ALL=始终 / ONE=单选 / SOME=多选 / ZERO=无选中 */
    type: MenuType | MenuType[]
    /** 菜单项描述 */
    desc?: string
    /** 子菜单 */
    children?: Array<MenuOptions>
    /** 点击回调，返回 false 则菜单不隐藏 */
    callback?: (e: {
        pointerEvent: PointerEvent,
        mouseEvent: MouseEvent,
        type: MenuType,
        key: string,
    }) => void | boolean
    /** 显示条件，返回 false 则当前不显示 */
    showCallback?: () => boolean
    /** 禁用条件，返回 true 则菜单灰显 */
    disableCallback?: () => boolean
}

/** 动态菜单项（函数返回 MenuOptions） */
export type MenuFuncOptions = () => MenuOptions


// ============================================================================
// 插件服务接口与常量
// ============================================================================

/** Shortcut 插件服务名 */
export const ShortcutPluginServiceName = "shortcut"

/** Shortcut 插件安装选项 */
export interface ShortcutPluginOptions {
    /** 是否将快捷键作用于全局（绑定到 document 而非编辑器视图）。默认 false */
    global?: boolean
}

/** Shortcut 插件提供的服务 */
export interface IShortcutPluginService {
    bindShortcut(
        keys: string | string[],
        callback: (e: KeyboardEvent, combo: string) => boolean | void
    ): void
    /** 以编程方式触发某个快捷键组合 */
    trigger(combo: string, action?: string): void
}

/** ContextMenu 插件服务名 */
export const ContextMenuPluginServiceName = "ContextMenu"

/** ContextMenu 插件提供的服务 */
export interface IContextMenuPluginService
    extends IService<IContextMenuPluginService> {
    registerContextMenu(
        menu: MenuFuncOptions| MenuFuncOptions[]
    ): void
    unRegisterContextMenu(key: string): void
}

/** Ruler 插件服务名 */
export const RulerPluginServiceName = "Ruler"

/** Ruler 插件提供的服务（合并标尺管理 + 网格线创建） */
export interface IRulerPluginService {
    // --- 标尺管理 ---
    readonly unitList: string[]
    readonly currentUnit: string
    changeUnit(unit: string): void
    isEnabled(): boolean
    setEnabled(enabled: boolean): void
    toggleEnabled(): void

    // --- 网格线管理 ---
    readonly gridLines: Line[]
    newGridLine(place: number, direction: 'h' | 'v'): Line
    addGridLine(line: Line): void
    removeGridLine(line: Line | string): void
    clearGridLines(): void
    gridLinesShow(): void
    gridLinesHide(): void
    gridLinesIsShow(): boolean
}

/** toolBar 插件服务名 */
export const ToolBarPluginServiceName = "toolBar"

/** 工具条按钮配置 */
export interface ToolBarItem {
    /** 唯一标识，重复 id 会覆盖已有项 */
    id: string
    /** 显示文本 */
    label?: string
    /** 点击回调，参数为当前选中的节点 */
    onClick?: (node: ILeaf) => void
    /** 可选的 HTML 图标字符串 */
    icon?: string
    /** 在此项之前显示分隔线 */
    divider?: boolean

    help?: string | (() => string)

    /** "one"=单选时显示, "some"=多选时显示, 不设置=仅由visible决定 */
    type?: "one" | "some"
    /** 自定义显示条件，type预过滤通过后调用。node=当前编辑节点/多选时为虚拟节点, type=item.type */
    visible?: (node: ILeaf, type: ToolBarItem["type"]) => boolean
}

/** toolBar 插件提供的服务 */
export interface IToolBarPluginService {
    /** 工具条是否显示 */
    shouldShowEditToolbar: boolean

    /** 添加或更新一个按钮 */
    addItem(item: ToolBarItem): void
    /** 按 id 移除按钮 */
    removeItem(id: string): void
    /** 获取当前全部按钮 */
    getItems(): ToolBarItem[]
    /** 清空全部按钮 */
    clearItems(): void
}


export const SnapPluginServiceName = "snap"

/** Snap 插件提供的服务 */
export interface ISnapPluginService {
    readonly isEnabled: boolean
    enable: () => void
    disable: () => void
}
