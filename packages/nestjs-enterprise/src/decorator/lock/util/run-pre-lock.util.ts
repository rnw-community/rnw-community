import { isDefined, isNotEmptyArray } from '@rnw-community/shared';

import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';

export const runPreLock = <TArgs extends unknown[] = unknown[]>(
    preLock: PreDecoratorFunction<TArgs, string[]> | string[],
    ...args: TArgs
): string[] => {
    if (Array.isArray(preLock) && isNotEmptyArray(preLock)) {
        return preLock;
    } else if (isDefined(preLock) && typeof preLock === 'function') {
        return preLock(args[0], args[1], args[2], args[3], args[4]);
    }

    throw new Error('Lock key is not defined');
};
