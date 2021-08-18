import { Logger, Module } from '@nestjs/common';

import { NestJsRxjsLoggerService } from './nestjs-rxjs-logger-service/nestjs-rxjs-logger.service';

@Module({
    imports: [],
    providers: [
        NestJsRxjsLoggerService,
        {
            provide: 'LOGGER',
            useValue: Logger,
        },
    ],
    exports: [NestJsRxjsLoggerService],
})
export class NestJsRxJsLoggerModule {}
