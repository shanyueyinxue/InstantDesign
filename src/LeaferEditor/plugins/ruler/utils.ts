type PlainObject = Record<string, any>

/** 辅助线方向 */
export type GuideDirection = 'horizontal' | 'vertical'

/**
 * 由辅助线自身的 rotation 推导方向（0 = 水平，90 = 垂直）
 * 注意：不要依赖 Ruler 的临时拖拽状态，拖动已有辅助线时不会更新该状态
 */
export function getGuideDirection(rotation: number | undefined): GuideDirection {
    return rotation === 90 ? 'vertical' : 'horizontal'
}

export function deepMerge<T extends PlainObject>(...sources: PlainObject[]): T {
    const result: PlainObject = {}
    for (const source of sources) {
        if (!source || typeof source !== 'object') continue
        for (const key of Object.keys(source)) {
            const srcVal = source[key]
            if (Array.isArray(srcVal)) {
                result[key] = [...srcVal]
            } else if (srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal)) {
                result[key] = deepMerge(result[key] || {}, srcVal)
            } else {
                result[key] = srcVal
            }
        }
    }
    return result as T
}
