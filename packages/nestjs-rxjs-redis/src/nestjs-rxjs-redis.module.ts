import { Module } from '@nestjs/common';

import { NestJSRxJSRedisCoreModule } from './nestjs-rxjs-redis-core.module';

import type { DynamicModule } from '@nestjs/common';
import type { RedisModuleAsyncOptions } from 'nestjs-redis';

@Module({})
export class NestJSRxJSRedisModule {
    static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
        return {
            module: NestJSRxJSRedisModule,
            imports: [NestJSRxJSRedisCoreModule.forRootAsync(options)],
        };
    }
}
