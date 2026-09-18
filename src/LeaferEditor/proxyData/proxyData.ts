import { shallowReactive, watch, type WatchStopHandle } from 'vue'

import { UI, defineKey } from 'leafer-ui'

defineKey(UI.prototype, 'proxyData', {
    get() {
        return this.__proxyData
            ? this.__proxyData
            : (this.__proxyData = this.createProxyData())
    },
})

UI.prototype.setProxyAttr = function (name: string, newValue: unknown): void {
    const data = this.__proxyData as any
    if (data[name] !== newValue) data[name] = newValue
}

UI.prototype.getProxyAttr = function (name: string): any {
    const value = (this.__proxyData as any)[name]
    return value === undefined ? this.__.__get(name) : value
}

UI.prototype.createProxyData = function () {
    const data = this.__.__getData()
    const proxyData = shallowReactive(data)

    const watchers: WatchStopHandle[] = []
    for (const name in data) {
        const stop = watch(
            () => (this.__proxyData ? this.getProxyAttr(name) : proxyData[name]),
            (newValue) => {
                if (this.__.__get(name) !== newValue) (this as any)[name] = newValue
            }
        )
        watchers.push(stop)
    }
    ;(this as any).__proxyWatchers = watchers

    return proxyData
}

UI.prototype.clearProxyData = function () {
    const watchers: WatchStopHandle[] | undefined = (this as any).__proxyWatchers
    if (watchers) {
        watchers.forEach(stop => stop())
        delete (this as any).__proxyWatchers
    }
    if (this.__proxyData) delete this.__proxyData
}