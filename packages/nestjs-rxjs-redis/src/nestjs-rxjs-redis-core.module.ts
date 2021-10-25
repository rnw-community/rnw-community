import { Global, Module } from '@nestjs/common';

import { NestJSRxJSRedisService } from './nestjs-rxjs-redis-service/nestjs-rxjs-redis.service';

import type { DynamicModule } from '@nestjs/common';
import type { RedisModuleAsyncOptions } from 'nestjs-redis';

@Global()
@Module({
    providers: [NestJSRxJSRedisService],
    exports: [NestJSRxJSRedisService],
})
export class NestJSRxJSRedisCoreModule {
    static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
        return {
            module: NestJSRxJSRedisCoreModule,
            imports: options.imports,
            exports: [NestJSRxJSRedisService],
        };
    }
}
