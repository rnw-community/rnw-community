import { Global, Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';

import { NestJSRxJSRedisService } from './nestjs-rxjs-redis-service/nestjs-rxjs-redis.service';

import type { DynamicModule } from '@nestjs/common';
import type { RedisModuleAsyncOptions } from '@nestjs-modules/ioredis';

@Global()
@Module({
    providers: [NestJSRxJSRedisService],
    exports: [NestJSRxJSRedisService],
})
export class NestJSRxJSRedisCoreModule {
    static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
        return {
            module: NestJSRxJSRedisCoreModule,
            imports: [RedisModule.forRootAsync(options)],
            exports: [NestJSRxJSRedisService],
        };
    }
}
