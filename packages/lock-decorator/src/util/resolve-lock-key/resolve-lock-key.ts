import type { AcquireOptionsInterface } from '../../interface/acquire-options.interface';
import type { LockArgumentType } from '../../type/lock-argument.type';

const assertNonEmptyKey = (key: string): string => {
    if (key === '') {
        throw new Error('Lock key cannot be empty');
    }

    return key;
};

export const resolveLockKey = <TArgs extends readonly unknown[]>(
    arg: LockArgumentType<TArgs>,
    args: TArgs
): { readonly key: string; readonly options: AcquireOptionsInterface } => {
    if (typeof arg === 'string') {
        return { key: assertNonEmptyKey(arg), options: {} };
    }

    if (typeof arg === 'function') {
        return { key: assertNonEmptyKey(arg(args)), options: {} };
    }

    const keyOrFn = arg.key;
    const resolvedKey = typeof keyOrFn === 'function' ? keyOrFn(args) : keyOrFn;

    return {
        key: assertNonEmptyKey(resolvedKey),
        options: {
            timeoutMs: (arg as { timeoutMs?: number }).timeoutMs,
            signal: (arg as { signal?: AbortSignal }).signal,
        },
    };
};
