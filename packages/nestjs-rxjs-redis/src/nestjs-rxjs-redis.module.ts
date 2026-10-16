import { Module } from '@nestjs/common';

import { NestJSRxJSRedisCoreModule } from './nestjs-rxjs-redis-core.module';

import type { DynamicModule } from '@nestjs/common';
import type { RedisModuleAsyncOptions } from '@nestjs-modules/ioredis';

/**
 * The NestJS module registering the ioredis connection and `NestJSRxJSRedisService`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-redis/readme.md#nestjsrxjsredismodule
 */
@Module({})
export class NestJSRxJSRedisModule {
    /**
     * Registers the module with asynchronously resolved `@nestjs-modules/ioredis` connection options.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-redis/readme.md#nestjsrxjsredismodule
     */
    static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
        return {
            module: NestJSRxJSRedisModule,
            imports: [NestJSRxJSRedisCoreModule.forRootAsync(options)],
        };
    }
}
