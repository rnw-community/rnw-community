import type { ExclusiveLockArgumentType } from '../../type/exclusive-lock-argument-type/exclusive-lock-argument.type';
import type { AcquireOptionsInterface } from '../../interface/acquire-options-interface/acquire-options.interface';
import type { SequentialLockArgumentType } from '../../type/sequential-lock-argument-type/sequential-lock-argument.type';

export interface ResolvedLockArgType {
    readonly key: string;
    readonly options: AcquireOptionsInterface;
}

export const resolveSequentialLockKey = <TArgs extends readonly unknown[]>(
    arg: SequentialLockArgumentType<TArgs>,
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

    return { key: resolvedKey, options: { timeoutMs: arg.timeoutMs, signal: arg.signal } };
};

export const resolveExclusiveLockKey = <TArgs extends readonly unknown[]>(
    arg: ExclusiveLockArgumentType<TArgs>,
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

    return { key: resolvedKey, options: {} };
};
