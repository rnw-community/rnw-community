import { Module } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';

import { NestJSRxJSRedisService } from './nestjs-rxjs-redis-service/nestjs-rxjs-redis.service';

import type { DynamicModule } from '@nestjs/common';
import type { RedisModuleAsyncOptions } from 'nestjs-redis';

@Module({})
export class NestJSRxJSRedisModule {
    static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
        return {
            module: NestJSRxJSRedisModule,
            imports: [RedisModule.forRootAsync(options)],
            providers: [NestJSRxJSRedisService],
            exports: [NestJSRxJSRedisService, RedisModule],
        };
    }
}
