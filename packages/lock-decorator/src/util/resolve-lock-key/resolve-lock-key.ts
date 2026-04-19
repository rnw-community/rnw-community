import type { AcquireOptionsInterface } from '../../interface/acquire-options-interface/acquire-options.interface';
import type { LockArgumentType } from '../../type/lock-argument-type/lock-argument.type';

export interface ResolvedLockArgType {
    readonly key: string;
    readonly options: AcquireOptionsInterface;
}

export const resolveLockKey = <TArgs extends readonly unknown[]>(
    arg: LockArgumentType<TArgs>,
    args: TArgs
): ResolvedLockArgType => {
    if (typeof arg === 'string') {
        return { key: arg, options: {} };
    }

    if (typeof arg === 'function') {
        return { key: arg(args), options: {} };
    }

    const keyOrFn = arg.key;
    const resolvedKey = typeof keyOrFn === 'function' ? keyOrFn(args) : keyOrFn;

    return {
        key: resolvedKey,
        options: {
            timeoutMs: (arg as { timeoutMs?: number }).timeoutMs,
            signal: (arg as { signal?: AbortSignal }).signal,
        },
    };
};
