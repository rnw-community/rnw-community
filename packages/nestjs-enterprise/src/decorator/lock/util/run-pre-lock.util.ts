import { isNotEmptyArray } from '@rnw-community/shared';

import type { PreDecoratorFunction } from '../../../pre-decorator-function.type';

export const runPreLock = <TArgs extends unknown[] = unknown[]>(
    preLock: PreDecoratorFunction<TArgs, string[]> | string[],
    ...args: TArgs
): string[] => {
    const keys = Array.isArray(preLock) ? preLock : preLock(...args);
    if (!isNotEmptyArray(keys)) {
        throw new Error('Lock key is not defined');
    }
    
return keys;
};
