/**
 * 服务接口 — 插件通过注册服务向外暴露能力
 *
 * @template S 服务对象的类型
 */
export interface IService<S = any> {
    /** 服务唯一名称 */
    readonly name: string;
    /** 服务描述 */
    readonly description?: string;
    /** 注册该服务的插件 */
    readonly plugin: IPlugin;
    /** 服务对象本身 */
    readonly service: S;
}

/**
 * 插件系统内部事件枚举
 */
export enum PluginEvent {
    /** 插件安装完成时触发 */
    install = "install",
    /** 插件卸载完成时触发 */
    uninstall = "uninstall",
    /** 服务注册完成时触发 */
    serviceRegistered = "serviceRegistered",
    /** 服务注销完成时触发 */
    serviceUnregistered = "serviceUnregistered"
}

/**
 * 插件事件载荷
 *
 * @template T 宿主实例类型
 */
export interface PluginEventPayload<T = any> {
    /** 触发事件的插件 */
    plugin: IPlugin<T>;
    /** 关联的服务（service 事件时提供） */
    service?: IService;
    /** 安装/卸载时传入的选项 */
    options?: any;
    /** 错误信息（安装/卸载失败时提供） */
    error?: Error;
}

/**
 * 插件接口 — 所有插件必须实现
 *
 * @template T 宿主实例类型（用于 getInstance()）
 * @template O 插件的 options 类型
 */
export interface IPlugin<T = any, O = any> {
    /** 插件唯一标识，用于依赖检查和服务关联 */
    readonly name: string;
    /** 插件描述信息 */
    readonly description?: string;
    /** 插件版本号 */
    readonly version?: string;
    /** 插件作者 */
    readonly author?: string;

    /** 插件依赖的其他插件名称列表，安装时会检查是否已安装 */
    readonly dependentPlugins?: string[];
    /** 插件依赖的服务名称列表，安装时会检查服务是否已注册 */
    readonly dependentServices?: string[];

    /**
     * 插件安装方法（必须实现）
     *
     * @param host 插件宿主实例，提供 registerService / getInstance 等能力
     * @param options 安装选项，由调用 use() 时传入
     */
    install: (host: IPluginHost<T>, options?: O) => void;
    /**
     * 插件卸载方法（可选）
     *
     * @param host 插件宿主实例
     */
    uninstall?: (host: IPluginHost<T>) => void;
}

/**
 * 插件生命周期状态枚举
 */
export enum PluginState {
    /** 等待安装（初始状态） */
    pending = 'pending',
    /** 正在安装 */
    installing = 'installing',
    /** 已安装成功 */
    installed = 'installed',
    /** 正在卸载 */
    uninstalling = 'uninstalling',
    /** 已卸载 */
    uninstalled = 'uninstalled',
    /** 安装或卸载过程出错 */
    error = 'error'
}

/**
 * 插件运行时信息
 *
 * @template T 宿主实例类型
 */
export interface IPluginInfo<T = any> {
    /** 插件实例 */
    plugin: IPlugin<T>;
    /** 当前状态 */
    state?: PluginState;
    /** 安装时传入的选项 */
    options?: any;
    /** 错误信息 */
    error?: Error;
}

/**
 * 插件宿主接口 — 任何类实现此接口即可成为"插件能力提供者"
 *
 * 使用方式：
 * 1. 继承 PluginHost 基类
 * 2. 通过 host.use(plugin) 安装插件
 * 3. 通过 host.getService(name) 获取插件提供的服务
 *
 * @template T 宿主实例自身的类型（传给插件的 getInstance() 返回值）
 */
export interface IPluginHost<T = any> {
    /**
     * 获取宿主实例
     *
     * 插件通过此方法获取宿主引用，进而访问宿主的能力（如编辑器 API）。
     * 默认实现返回 this。
     */
    getInstance: () => T;

    /**
     * 安装插件
     *
     * 执行流程：检查依赖 → 执行 plugin.install(host, options) → 触发 install 事件
     *
     * @param plugin 插件实例
     * @param options 传递给插件的安装选项
     * @returns 宿主自身，支持链式调用
     */
    use: <O>(plugin: IPlugin<T, O>, options?: O) => any;

    /**
     * 卸载插件
     *
     * 执行流程：清理该插件注册的 hooks → 注销该插件注册的全部服务 → 执行 plugin.uninstall(host) → 触发 uninstall 事件
     *
     * @param pluginName 插件名称
     * @param autoCleanupServices 是否自动清理该插件注册的服务，默认 true
     */
    unuse: (pluginName: string, autoCleanupServices?: boolean) => void;

    /**
     * 注册服务（底层 API，推荐使用 registerServiceFor）
     *
     * 将插件提供的能力注册到宿主，供其他插件或外部代码通过 getService 获取。
     *
     * @param service 服务描述对象
     */
    registerService: (service: IService) => void;

    /**
     * 便捷方法：为指定插件注册一个服务
     *
     * 与手动构造 IService 对象等价，简化插件方的调用代码。
     *
     * @param plugin 注册该服务的插件
     * @param name 服务唯一名称
     * @param service 服务对象
     * @param description 可选的服务描述
     */
    registerServiceFor: (plugin: IPlugin<T>, name: string, service: any, description?: string) => void;

    /**
     * 注销服务
     *
     * @param name 服务名称
     */
    unregisterService: (name: string) => void;

    /**
     * 获取插件运行时信息
     *
     * @param name 插件名称
     * @returns 插件信息，未找到返回 undefined
     */
    getPluginInfo: (name: string) => IPluginInfo<T> | undefined;

    /**
     * 获取全部插件运行时信息列表
     */
    getPluginInfos: () => IPluginInfo<T>[];

    /**
     * 通过服务名称获取服务对象
     *
     * @template S 服务对象的类型
     * @param name 服务名称
     * @returns 服务对象，未找到返回 undefined
     */
    getService: <S>(name: string) => S | undefined;

    /**
     * 获取全部已注册的服务列表
     */
    getServices: () => IService[];

    /**
     * 检查指定插件是否已安装
     */
    hasPlugin: (name: string) => boolean;

    /**
     * 检查指定服务是否已注册
     */
    hasService: (name: string) => boolean;

    /**
     * 添加插件生命周期事件钩子
     *
     * 当指定 PluginEvent 发生时触发 listener。
     *
     * @param event 关注的事件类型
     * @param listener 回调函数
     * @param sourcePluginName 可选的来源插件名，用于在卸载时自动清理；不传则不关联任何插件
     */
    hook: (event: PluginEvent, listener: (payload: PluginEventPayload<T>) => void, sourcePluginName?: string) => void;

    /**
     * 移除插件生命周期事件钩子
     *
     * @param event 事件类型
     * @param listener 要移除的回调函数
     */
    unhook: (event: PluginEvent, listener: (payload: PluginEventPayload<T>) => void) => void;
}
