/* eslint-disable @typescript-eslint/naming-convention */
/**
 * The log levels accepted by `NestJSRxJSLoggerService.print` and `create$`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-logger/readme.md#apploglevelenum
 */
export enum AppLogLevelEnum {
    debug = 'debug',
    error = 'error',
    info = 'info',
    verbose = 'verbose',
    warn = 'warn',
}
