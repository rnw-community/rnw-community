import type { LockArgumentType } from '../type/lock-argument.type';

export interface ResolvedLockArgType {
    readonly key: string;
    readonly timeoutMs?: number;
}

export const resolveLockKey = <TArgs extends readonly unknown[]>(
    arg: LockArgumentType<TArgs>,
    args: TArgs
): ResolvedLockArgType => {
    if (typeof arg === 'string') {
        return { key: arg };
    }

    if (typeof arg === 'function') {
        return { key: arg(args) };
    }

    // Object form: { key, timeoutMs? }
    const keyOrFn = arg.key;
    const resolvedKey = typeof keyOrFn === 'function' ? keyOrFn(args) : keyOrFn;

    return { key: resolvedKey, timeoutMs: arg.timeoutMs };
};
