import { Inject } from '@nestjs/common';

import type { LockServiceInterface } from '../interface/lock-service.interface';
import type { AbstractConstructor } from '@rnw-community/shared';

export const injectLockService = (
    target: object,
    serviceToken: AbstractConstructor<LockServiceInterface>,
    symbol: symbol
): void => {
    Inject(serviceToken)(target, symbol);
};
