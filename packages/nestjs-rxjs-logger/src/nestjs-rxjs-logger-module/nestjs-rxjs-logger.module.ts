import { Logger, Module } from '@nestjs/common';

import { NestJSRxJSLoggerService } from '../nestjs-rxjs-logger-service/nestjs-rxjs-logger.service';

@Module({
    imports: [],
    providers: [NestJSRxJSLoggerService, { provide: 'LOGGER', useValue: Logger }],
    exports: [NestJSRxJSLoggerService],
})
export class NestJSRxJSLoggerModule {}
