import type { EventsParam, EventType } from "./eventType";
// import { EventTypes } from "./eventType";

interface EventBusOptions {
    onError?: (error: Error, type: EventType, handler: Function, param: any) => void;
}

export class MittBus {
    private all: Map<EventType, Set<(param: any) => void>> = new Map();
    private external: Map<string, Set<(options?: any) => void>> = new Map();
    private options: EventBusOptions;
    private isOn: boolean = true;
    
    constructor(options?: EventBusOptions) {
        this.options = options || {};
        if (!this.options.onError) {
            this.options.onError = this.defaultErrorHandler;
        }
    }
    stop() {
        this.isOn = false;
    }
    start() {
        this.isOn = true;
    }

    on<T extends EventType>(type: T, handler: (param: EventsParam[T]) => void) {
        if (!type || typeof handler !== 'function') {
            throw new Error('Invalid arguments: type must be defined and handler must be a function');
        }

        if (!this.all.has(type)) {
            this.all.set(type, new Set());
        }
        this.all.get(type)!.add(handler);
    }

    off<T extends EventType>(type: T, handler: (param: EventsParam[T]) => void) {
        if (!this.all.has(type)) {
            return;
        }
        this.all.get(type)!.delete(handler);
        // 清理空集合
        if (this.all.get(type)!.size === 0) {
            this.all.delete(type);
        }
    }

    once<T extends EventType>(type: T, handler: (param: EventsParam[T]) => void) {
        const _handler = (p: EventsParam[T]) => {
            try {
                handler(p);
            } finally {
                this.off(type, _handler);
            }
        }
        this.on(type, _handler)
    }

    emit<T extends EventType>(type: T, param: EventsParam[T]) {
        if (!this.isOn) {
            return
        };
        const handlers = this.all.get(type);
        if (!handlers) return;

        // 复制 handlers 避免在迭代过程中修改集合
        const handlersCopy = new Set(handlers);
        handlersCopy.forEach((handler) => {
            try {
                handler(param);
            } catch (error) {
                this.options.onError?.(error as Error, type, handler, param);
            }
        });
    }

    clear(type?: EventType) {
        if (type) {
            this.all.delete(type);
        } else {
            this.all.clear();
        }
    }

    onExternal(eventName: string, handler: (options?: any) => void) {
        if (!eventName || typeof handler !== 'function') {
            throw new Error('Invalid arguments: eventName must be defined and handler must be a function');
        }
        if (!this.external.has(eventName)) {
            this.external.set(eventName, new Set());
        }
        this.external.get(eventName)!.add(handler);
    }

    offExternal(eventName: string, handler: (options?: any) => void) {
        if (!this.external.has(eventName)) {
            return;
        }
        this.external.get(eventName)!.delete(handler);
        if (this.external.get(eventName)!.size === 0) {
            this.external.delete(eventName);
        }
    }

    emitExternal(eventName: string, options?: any) {
        if (!this.isOn) {
            return;
        }
        const handlers = this.external.get(eventName);
        if (!handlers) return;
        const handlersCopy = new Set(handlers);
        handlersCopy.forEach((handler) => {
            try {
                handler(options);
            } catch (error) {
                console.error(`[MittBus] External handler error for event "${eventName}":`, error);
            }
        });
    }

    hasExternal(eventName: string): boolean {
        return this.external.has(eventName);
    }

    clearExternal(eventName?: string) {
        if (eventName) {
            this.external.delete(eventName);
        } else {
            this.external.clear();
        }
    }

    destroy() {
        this.all.clear();
        this.external.clear();
        this.isOn = false;
    }

    private defaultErrorHandler = (error: Error, type: EventType, handler: Function, param: any) => {
        const handlerName = handler.name || 'anonymous';
        let paramStr;
        try {
            if (!param) {
                paramStr = 'undefined';
            } else {
                paramStr = typeof param === 'object'
                    ? JSON.stringify(param)
                    : String(param);
            }
        } catch {
            paramStr = '[Unstringifiable]';
        }
        console.error(`[MittBus] Handler "${handlerName}" error for event "${type}" (param: ${paramStr}):`, error);
    };
}
