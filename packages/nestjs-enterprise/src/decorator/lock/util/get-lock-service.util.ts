import { isDefined } from '@rnw-community/shared';

import type { LockServiceInterface } from '../interface/lock-service.interface';

export const getLockService = (instance: Record<symbol, unknown>, symbol: symbol): LockServiceInterface => {
    const service = instance[symbol] as LockServiceInterface | undefined;
    if (!isDefined(service)) {
        throw new Error('LockService was not injected. Ensure the lock service provider is registered in the NestJS module.');
    }

    return service;
};
