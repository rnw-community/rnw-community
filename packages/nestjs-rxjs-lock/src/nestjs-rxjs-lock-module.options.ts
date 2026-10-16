import type { Settings } from 'redlock';

/**
 * The Redlock settings plus the default lock expiration accepted by `NestJSRxJSLockModule.registerTypedAsync`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-lock/readme.md#nestjsrxjslockmoduleoptions
 */
export interface NestJSRxJSLockModuleOptions extends Settings {
    /** The lock expiration in milliseconds used when `lock$` receives no explicit `expireInMs`. */
    defaultExpireMs: number;
}

/**
 * The default module options that `registerTypedAsync` merges caller options over.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-lock/readme.md#defaultnestjsrxjslockmoduleoptions
 */
export const defaultNestJSRxJSLockModuleOptions: NestJSRxJSLockModuleOptions = {
    defaultExpireMs: 10000,
    retryCount: 0,
    driftFactor: 0.01,
    retryDelay: 200,
    retryJitter: 200,
    automaticExtensionThreshold: 500,
};
