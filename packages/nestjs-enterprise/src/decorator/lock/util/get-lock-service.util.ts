import type { LockServiceInterface } from '../interface/lock-service.interface';

export const getLockService = (instance: Record<symbol, unknown>, symbol: symbol): LockServiceInterface =>
    instance[symbol] as LockServiceInterface;
