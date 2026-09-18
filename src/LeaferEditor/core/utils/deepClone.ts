/**
 * 深拷贝对象，可正确处理循环引用、Date、RegExp、Map、Set、数组及普通对象（包含 Symbol 属性）
 * @param obj - 需要拷贝的对象
 * @returns 深拷贝后的新对象
 */
export function deepClone<T>(obj: T): T {
    const hash = new WeakMap<object, any>()
    /**
     * 深拷贝对象，可正确处理循环引用、Date、RegExp、Map、Set、数组及普通对象（包含 Symbol 属性）
     * @param obj - 需要拷贝的对象
     * @param hash - 内部使用的 WeakMap，用于记录已拷贝的对象以避免循环引用
     * @returns 深拷贝后的新对象
     */
    function _deepClone(obj: T, hash = new WeakMap<object, any>()): T {
        // 基本类型、null 和函数直接返回（函数共享引用）
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        // 已拷贝过的对象直接返回，避免循环引用
        if (hash.has(obj)) {
            return hash.get(obj);
        }

        // 处理 Date
        if (obj instanceof Date) {
            const copy = new Date(obj.getTime());
            hash.set(obj, copy);
            return copy as any;
        }

        // 处理 RegExp
        if (obj instanceof RegExp) {
            const copy = new RegExp(obj.source, obj.flags);
            hash.set(obj, copy);
            return copy as any;
        }

        // 处理 Map
        if (obj instanceof Map) {
            const copy = new Map();
            hash.set(obj, copy);
            obj.forEach((value, key) => {
                copy.set(_deepClone(key, hash), _deepClone(value, hash));
            });
            return copy as any;
        }

        // 处理 Set
        if (obj instanceof Set) {
            const copy = new Set();
            hash.set(obj, copy);
            obj.forEach(value => {
                copy.add(_deepClone(value, hash));
            });
            return copy as any;
        }

        // 处理数组
        if (Array.isArray(obj)) {
            const copy: any[] = [];
            hash.set(obj, copy);
            obj.forEach((item, index) => {
                copy[index] = _deepClone(item, hash);
            });
            return copy as any;
        }

        // 处理普通对象（包括字面量对象等）
        const copy: Record<string | symbol, any> = {};
        hash.set(obj, copy);

        // 获取所有自有可枚举属性（包括 Symbol 键）
        const keys = Reflect.ownKeys(obj).filter(key =>
            Object.prototype.propertyIsEnumerable.call(obj, key)
        );

        for (const key of keys) {
            (copy as any)[key] = _deepClone((obj as any)[key], hash);
        }

        return copy as any;
    }
    return _deepClone(obj);
}
export default deepClone;
