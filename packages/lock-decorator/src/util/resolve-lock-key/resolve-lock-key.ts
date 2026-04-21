import { isString } from '@rnw-community/shared';

import { assertValidTimeoutMs } from '../assert-valid-timeout-ms/assert-valid-timeout-ms';

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
    if (isString(arg)) {
        return { key: assertNonEmptyKey(arg), options: {} };
    }

    if (typeof arg === 'function') {
        return { key: assertNonEmptyKey(arg(args)), options: {} };
    }

    const keyOrFn = arg.key;
    const resolvedKey = typeof keyOrFn === 'function' ? keyOrFn(args) : keyOrFn;
    const { timeoutMs } = arg as { timeoutMs?: number };

    assertValidTimeoutMs(timeoutMs);

    return {
        key: assertNonEmptyKey(resolvedKey),
        options: {
            timeoutMs,
            signal: (arg as { signal?: AbortSignal }).signal,
        },
    };
};
