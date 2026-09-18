import { PluginEvent, PluginState } from "./interfaces";
import type {
    IPluginHost,
    IPlugin,
    IPluginInfo,
    IService,
    PluginEventPayload
} from "./interfaces";

/**
 * 插件宿主基类 — 任何类继承此类即可获得完整的插件系统能力
 *
 * 提供的能力：
 * - 插件安装/卸载与生命周期管理
 * - 服务注册/注销与查询
 * - 插件依赖检查
 * - 插件事件钩子（支持关联 source 插件，卸载时自动清理）
 *
 * 使用方式：
 * ```typescript
 * class MyApp extends PluginHost<MyApp> {
 *     constructor() {
 *         super()
 *         this.use(new SomePlugin(), { key: 'value' })
 *         const svc = this.getService<ISomeService>('serviceName')
 *     }
 * }
 * ```
 *
 * @template T 宿主实例自身的类型，getInstance() 返回此类型
 */
export class PluginHost<T = any> implements IPluginHost<T> {
    /** 插件名 → 插件运行时信息 */
    private pluginInfos: Map<string, IPluginInfo<T>> = new Map();
    /** 服务名 → 服务描述对象 */
    private services: Map<string, IService> = new Map();
    /** 插件名 → 该插件注册的服务名集合，用于卸载时 O(1) 清理 */
    private pluginServiceMap: Map<string, Set<string>> = new Map();
    /** 事件类型 → 监听器集合 */
    private eventListeners: Map<PluginEvent, Set<(payload: PluginEventPayload<T>) => void>> = new Map();
    /** 事件类型 → (监听器 → 来源插件名)，用于卸载时自动清理 */
    private hookSources: Map<PluginEvent, Map<Function, string>> = new Map();

    /**
     * 获取宿主实例
     *
     * 默认返回当前实例。如果宿主类确实不是泛型 T 指定的类型，
     * 子类可以 override 此方法返回正确的实例。
     *
     * @returns 宿主实例
     */
    getInstance(): T {
        return this as unknown as T;
    }

    /**
     * 安装插件
     *
     * 流程：状态检查 → 依赖检查 → 执行 plugin.install() → 触发 PluginEvent.install
     *
     * @param plugin 插件实例
     * @param options 传递给插件的安装选项
     * @returns this，支持链式调用
     */
    use<O>(plugin: IPlugin<T, O>, options?: O): this {
        const pluginName = plugin.name;

        const existing = this.pluginInfos.get(pluginName);
        if (existing) {
            if (existing.state === PluginState.installed) {
                console.warn(`Plugin ${pluginName} is already installed.`);
                return this;
            }
            if (existing.state === PluginState.uninstalled) {
                console.warn(`Plugin ${pluginName} is in uninstalled state, but it is being used again.`);
                this.pluginInfos.delete(pluginName);
            }
            if (existing.state === PluginState.error) {
                console.warn(`Plugin ${pluginName} is in error state, retrying installation.`);
                this.pluginInfos.delete(pluginName);
            }
        }

        if (!this.checkDependencies(plugin)) {
            return this;
        }

        const pluginInfo: IPluginInfo<T> = {
            plugin,
            state: PluginState.pending,
            options,
            error: undefined
        };
        this.pluginInfos.set(pluginName, pluginInfo);
        pluginInfo.state = PluginState.installing;

        try {
            plugin.install(this, options);
            pluginInfo.state = PluginState.installed;
            this.emit(PluginEvent.install, { plugin, options });
            console.debug(`Plugin ${pluginName} installed.`);
        } catch (error) {
            console.error(`Failed to install plugin ${pluginName}:`, error);
            pluginInfo.state = PluginState.error;
            pluginInfo.error = error as Error;
            this.emit(PluginEvent.install, { plugin, options, error: pluginInfo.error });
            throw error;
        }

        return this;
    }

    /**
     * 卸载插件
     *
     * 流程：清理 hooks → 清理该插件的全部服务 → 执行 plugin.uninstall() → 触发 PluginEvent.uninstall
     *
     * @param pluginName 要卸载的插件名称
     * @param autoCleanupServices 是否自动清理该插件注册的服务，默认 true
     */
    unuse(pluginName: string, autoCleanupServices: boolean = true): void {
        const pluginInfo = this.pluginInfos.get(pluginName);
        if (!pluginInfo) {
            console.warn(`Plugin ${pluginName} not found.`);
            return;
        }
        if (pluginInfo.state !== PluginState.installed) {
            console.warn(`Plugin ${pluginName} is not installed (current state: ${pluginInfo.state}).`);
            return;
        }

        const plugin = pluginInfo.plugin;
        pluginInfo.state = PluginState.uninstalling;

        try {
            // 清理该插件注册的 hook 监听
            this.removeHooksForPlugin(pluginName);

            // 清理该插件注册的服务
            if (autoCleanupServices) {
                const serviceNames = this.pluginServiceMap.get(pluginName);
                if (serviceNames) {
                    serviceNames.forEach(name => {
                        this.services.delete(name);
                    });
                    this.pluginServiceMap.delete(pluginName);
                }
            }

            // 执行插件自身的卸载逻辑
            if (plugin.uninstall) {
                plugin.uninstall(this);
            }

            this.pluginInfos.delete(pluginName);
            this.emit(PluginEvent.uninstall, { plugin, options: pluginInfo.options });
        } catch (error) {
            console.error(`Failed to uninstall plugin ${pluginName}:`, error);
            pluginInfo.state = PluginState.error;
            pluginInfo.error = error as Error;
            this.emit(PluginEvent.uninstall, { plugin, options: pluginInfo.options, error: pluginInfo.error });
            throw error;
        }
    }

    /**
     * 注册服务（底层 API）
     *
     * 推荐插件方使用 registerServiceFor 便捷方法。
     *
     * @param service 服务描述对象
     */
    registerService(service: IService): void {
        if (this.services.has(service.name)) {
            console.warn(`Service ${service.name} is already registered.`);
            return;
        }
        this.services.set(service.name, service);

        // 维护插件 → 服务映射，用于高效卸载
        const pluginName = service.plugin.name;
        let names = this.pluginServiceMap.get(pluginName);
        if (!names) {
            names = new Set();
            this.pluginServiceMap.set(pluginName, names);
        }
        names.add(service.name);

        this.emit(PluginEvent.serviceRegistered, { plugin: service.plugin, service });
    }

    /**
     * 便捷方法：为指定插件注册一个服务
     *
     * @param plugin 注册该服务的插件
     * @param name 服务唯一名称
     * @param svc 服务对象
     * @param description 可选的服务描述
     */
    registerServiceFor(
        plugin: IPlugin<T>,
        name: string,
        svc: any,
        description?: string
    ): void {
        this.registerService({
            name,
            service: svc,
            description,
            plugin,
        });
    }

    /**
     * 注销服务
     *
     * @param name 服务名称
     */
    unregisterService(name: string): void {
        const service = this.services.get(name);
        if (!service) {
            console.warn(`Service ${name} not found.`);
            return;
        }
        this.services.delete(name);

        // 清理插件 → 服务映射
        const names = this.pluginServiceMap.get(service.plugin.name);
        if (names) {
            names.delete(name);
        }

        this.emit(PluginEvent.serviceUnregistered, { plugin: service.plugin, service });
    }

    /**
     * 获取插件的运行时信息
     */
    getPluginInfo(name: string): IPluginInfo<T> | undefined {
        return this.pluginInfos.get(name);
    }

    /**
     * 获取全部已安装插件的运行时信息
     */
    getPluginInfos(): IPluginInfo<T>[] {
        return Array.from(this.pluginInfos.values());
    }

    /**
     * 通过服务名获取服务对象
     *
     * @template S 服务对象的预期类型
     * @param name 服务名称
     * @returns 服务对象，未找到返回 undefined
     */
    getService<S>(name: string): S | undefined {
        const service = this.services.get(name);
        return service?.service as S;
    }

    /**
     * 获取全部已注册服务列表
     */
    getServices(): IService[] {
        return Array.from(this.services.values());
    }

    /**
     * 检查指定名称的插件是否已安装
     */
    hasPlugin(pluginName: string): boolean {
        return this.pluginInfos.has(pluginName);
    }

    /**
     * 检查指定名称的服务是否已注册
     */
    hasService(serviceName: string): boolean {
        return this.services.has(serviceName);
    }

    /**
     * 添加插件生命周期事件钩子
     *
     * @param event 关注的事件类型
     * @param listener 回调函数
     * @param sourcePluginName 可选：关联的插件名称，卸载该插件时会自动移除此 hook
     */
    hook(
        event: PluginEvent,
        listener: (payload: PluginEventPayload<T>) => void,
        sourcePluginName?: string
    ): void {
        let listeners = this.eventListeners.get(event);
        if (!listeners) {
            listeners = new Set();
            this.eventListeners.set(event, listeners);
        }
        listeners.add(listener);

        // 记录来源关联，以便卸载时自动清理
        if (sourcePluginName) {
            let sources = this.hookSources.get(event);
            if (!sources) {
                sources = new Map();
                this.hookSources.set(event, sources);
            }
            sources.set(listener, sourcePluginName);
        }
    }

    /**
     * 移除插件生命周期事件钩子
     *
     * @param event 事件类型
     * @param listener 要移除的监听器
     */
    unhook(event: PluginEvent, listener: (payload: PluginEventPayload<T>) => void): void {
        const listeners = this.eventListeners.get(event);
        if (!listeners) {
            return;
        }
        listeners.delete(listener);

        // 清理来源关联
        const sources = this.hookSources.get(event);
        if (sources) {
            sources.delete(listener);
        }
    }

    /**
     * 私有：触发插件生命周期事件
     *
     * 遍历该事件的所有监听器并执行。单个监听器异常不会影响其他监听器的执行。
     */
    private emit(event: PluginEvent, payload: PluginEventPayload<T>): void {
        const listeners = this.eventListeners.get(event);
        if (!listeners) {
            return;
        }
        listeners.forEach(listener => {
            try {
                listener(payload);
            } catch (error) {
                console.error(`Plugin event listener error for ${event}:`, error);
            }
        });
    }

    /**
     * 私有：检查插件的依赖是否满足
     */
    private checkDependencies(plugin: IPlugin<T>): boolean {
        if (plugin.dependentPlugins) {
            for (const depName of plugin.dependentPlugins) {
                const depInfo = this.pluginInfos.get(depName);
                if (!depInfo || depInfo.state !== PluginState.installed) {
                    console.warn(
                        `Plugin ${plugin.name} depends on plugin '${depName}', which is not installed.`
                    );
                    return false;
                }
            }
        }
        if (plugin.dependentServices) {
            for (const depName of plugin.dependentServices) {
                if (!this.services.has(depName)) {
                    console.warn(
                        `Plugin ${plugin.name} depends on service '${depName}', which is not registered.`
                    );
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 私有：清理指定插件注册的所有事件钩子
     */
    private removeHooksForPlugin(pluginName: string): void {
        this.hookSources.forEach((sources, event) => {
            const toRemove: Function[] = [];
            sources.forEach((sourceName, listener) => {
                if (sourceName === pluginName) {
                    toRemove.push(listener);
                }
            });
            toRemove.forEach(listener => {
                sources.delete(listener);
                const listeners = this.eventListeners.get(event);
                if (listeners) {
                    listeners.delete(listener as (payload: PluginEventPayload<T>) => void);
                }
            });
        });
    }

    clearPlugins(): void {
        const names = Array.from(this.pluginInfos.keys())
        for (const name of names) {
            const info = this.pluginInfos.get(name)
            if (info && info.state === PluginState.installed && info.plugin.uninstall) {
                try {
                    info.plugin.uninstall(this)
                } catch (e) {
                    console.error(`Error uninstalling plugin ${name} during clear:`, e)
                }
            }
        }
        this.pluginInfos.clear()
        this.services.clear()
        this.pluginServiceMap.clear()
        this.eventListeners.clear()
        this.hookSources.clear()
    }
}
