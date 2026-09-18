/**
 * 在浏览器空闲时执行指定的函数
 * @param fn 要执行的函数，接收 IdleDeadline 用于判断剩余空闲时间
 * @param options 可选的配置项（如 timeout），直接透传给 requestIdleCallback
 * @returns 一个清理函数，可用于取消空闲回调
 */
function runWhenIdle(fn: (idleDeadline: IdleDeadline) => void, options?: IdleRequestOptions): () => void {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        const handle = window.requestIdleCallback(fn, options);
        return () => window.cancelIdleCallback(handle);
    }
    else {
        const handle = setTimeout(fn, 1);
        return () => clearTimeout(handle);
    }
}

/**
 * 利用 requestIdleCallback 在每个空闲帧中持续执行工作，直到预算用完或工作完成。
 * workFn: 接收 IdleDeadline，内部通过 deadline.timeRemaining() 控制每次处理量。
 *         返回 true 表示还有更多工作待做，返回 false 表示全部完成。
 * @param workFn 工作函数，返回是否还有更多工作
 * @param options 可选的配置项（如 timeout），透传给 requestIdleCallback
 * @returns Promise，全部工作完成后 resolve
 */
function runWhenIdleWithBudget(
    workFn: (deadline: IdleDeadline) => boolean,
    options?: IdleRequestOptions
): Promise<void> {
    return new Promise<void>((resolve) => {
        const hasRIC = typeof window !== "undefined" && "requestIdleCallback" in window;

        function tick(deadline: IdleDeadline) {
            const hasMore = workFn(deadline);
            if (hasMore) {
                if (hasRIC) {
                    window.requestIdleCallback(tick as IdleRequestCallback, options);
                } else {
                    setTimeout(() => tick({ timeRemaining: () => 50, didTimeout: false }), 1);
                }
            } else {
                resolve();
            }
        }

        if (hasRIC) {
            window.requestIdleCallback(tick as IdleRequestCallback, options);
        } else {
            setTimeout(() => tick({ timeRemaining: () => 50, didTimeout: false }), 1);
        }
    });
}

export { runWhenIdle, runWhenIdleWithBudget };
export default runWhenIdle;
