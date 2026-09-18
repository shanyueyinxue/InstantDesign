type PlainObject = Record<string, any>

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
