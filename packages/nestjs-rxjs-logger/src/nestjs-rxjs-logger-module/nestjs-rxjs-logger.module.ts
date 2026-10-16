
import { Logger, Module } from '@nestjs/common';

import { NestJSRxJSLoggerService } from '../nestjs-rxjs-logger-service/nestjs-rxjs-logger.service';

/**
 * The NestJS module providing `NestJSRxJSLoggerService` bound to the NestJS `Logger`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-logger/readme.md#nestjsrxjsloggermodule
 */
@Module({
    imports: [],
    providers: [NestJSRxJSLoggerService, { provide: 'LOGGER', useValue: Logger }],
    exports: [NestJSRxJSLoggerService],
})
export class NestJSRxJSLoggerModule {}
