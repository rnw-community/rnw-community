// eslint-disable-next-line max-classes-per-file
import { NestJSRxJSLoggerService } from './nestjs-rxjs-logger-service/nestjs-rxjs-logger.service';
import { NestJSRxJSLoggerModule } from './nestjs-rxjs-logger.module';

export * from './app-log-level.enum';

export * from './nestjs-rxjs-logger-service/nestjs-rxjs-logger.service';
export * from './nestjs-rxjs-logger.module';

/** @deprecated Wrong naming - @see NestJSRxJSRedisModule */
export class NestJsRxJsLoggerModule extends NestJSRxJSLoggerModule {}

/** @deprecated Wrong naming - @see NestJsRxjsLoggerService */
export class NestJsRxjsLoggerService extends NestJSRxJSLoggerService {}
