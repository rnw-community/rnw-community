import { isNotEmptyArray } from '@rnw-community/shared';

import type { PreDecoratorFunction } from '../../type/pre-decorator-function.type';

export const resolveResources = <TArgs extends unknown[]>(
    preLock: PreDecoratorFunction<TArgs, string[]> | string[],
    args: TArgs
): string[] => {
    const resources = Array.isArray(preLock) ? preLock : preLock(...args);
    if (!isNotEmptyArray(resources)) {
        throw new Error('Lock key is not defined');
    }

    return resources as string[];
};
