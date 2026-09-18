/**
 * 分组
 */
import { Rect } from "leafer-ui";
import { getCommonOptions, type LayerInfo } from "./common";
import type { RGB } from "ag-psd";

/**
 * 转换Group元素
 * @param layer 图层信息
 * @param options 额外属性
 */
export function parseRect(layer: LayerInfo, options = {}) {
    //  打组
    const rect = new Rect({
        name: layer.name,
        zIndex: layer.zIndex,
        draggable: true,
        hitChildren: false,
        ...getCommonOptions(layer)
    })
    if (layer.vectorFill && layer.vectorFill.type === "color") {
        const color = (layer.vectorFill.color as RGB) || { r: 0, g: 0, b: 0 }
        const r = color.r
        const g = color.g
        const b = color.b
        rect.fill = [{
            type: 'solid',
            color: `rgba(${r}, ${g}, ${b}, 1)`
        }]
    }
    return rect
}

export const rectUtil = {}
