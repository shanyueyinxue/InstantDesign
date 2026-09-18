// 判断是否为“纯对象”（{} 或 new Object()）
function isPlainObject(value: any): value is Record<string, any> {
    if (value === null || typeof value !== 'object') return false;
    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
}

// 深度合并选项
interface DeepMergeOptions {
    arrayMerge?: 'replace' | 'concat' | ((target: any[], source: any[]) => any[]);
    allowUndefinedOverwrite?: boolean;      // 是否允许 source 中 undefined 覆盖
    mergeNullAsObject?: boolean;             // null 是否视为空对象（触发递归）
    preservePrototypes?: boolean;            // 是否保留原型链（默认 false，仅合并自身属性）
}

export function deepMerge<T extends Record<string, any>>(
    target: T,
    source: Partial<T>,
    options: DeepMergeOptions = {}
): T {
    const {
        arrayMerge = 'replace',
        allowUndefinedOverwrite = false,
        mergeNullAsObject = false,
        preservePrototypes = false,
    } = options;

    // 循环引用检测
    const stack = new WeakMap<object, any>();

    function merge(base: any, ext: any): any {
        // 基本类型或特殊对象直接返回
        if (ext === undefined && !allowUndefinedOverwrite) return base;
        if (ext === null) return mergeNullAsObject ? (isPlainObject(base) ? {} : base) : ext;
        if (!isPlainObject(ext)) return ext;

        // 处理循环引用
        if (stack.has(ext)) return stack.get(ext);

        // 确定目标对象（保留原型或纯对象）
        let targetObj: any;
        if (preservePrototypes && base && typeof base === 'object') {
            targetObj = Object.create(Object.getPrototypeOf(base));
            Object.assign(targetObj, base);
        } else {
            targetObj = { ...(isPlainObject(base) ? base : {}) };
        }
        stack.set(ext, targetObj);

        for (const key of Object.keys(ext)) {
            const extVal = ext[key];
            const baseVal = base?.[key];

            if (Array.isArray(extVal)) {
                // 数组处理策略
                if (Array.isArray(baseVal) && arrayMerge !== 'replace') {
                    if (arrayMerge === 'concat') targetObj[key] = [...baseVal, ...extVal];
                    else if (typeof arrayMerge === 'function') targetObj[key] = arrayMerge(baseVal, extVal);
                } else {
                    targetObj[key] = [...extVal]; // 浅拷贝新数组
                }
            } else if (isPlainObject(extVal)) {
                targetObj[key] = merge(baseVal, extVal);
            } else {
                // 普通值（包括 Date, RegExp 等非纯对象）
                if (extVal === undefined && !allowUndefinedOverwrite) continue;
                targetObj[key] = extVal;
            }
        }
        return targetObj;
    }

    return merge(target, source);
}