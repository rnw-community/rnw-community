import type { Settings } from 'redlock';

export interface NestJSRxJSLockModuleOptions extends Settings {
    defaultExpireMs: number;
}

export const defaultNestJSRxJSLockModuleOptions: NestJSRxJSLockModuleOptions = {
    defaultExpireMs: 10000,
    retryCount: 0,
    driftFactor: 0.01,
    retryDelay: 200,
    retryJitter: 200,
    automaticExtensionThreshold: 500,
};
