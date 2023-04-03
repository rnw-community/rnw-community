import type Redlock from 'redlock';

export interface NestJSRxJSLockModuleOptions extends Redlock.Options {
    defaultExpireMs: number;
}

export const defaultNestJSRxJSLockModuleOptions: NestJSRxJSLockModuleOptions = {
    defaultExpireMs: 10000,
    retryCount: 0,
};
