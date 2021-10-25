import { Module } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';

import { NestJSRxJSRedisService } from './nestjs-rxjs-redis-service/nestjs-rxjs-redis.service';

import type { DynamicModule, ModuleMetadata } from '@nestjs/common';

@Module({
    imports: [RedisModule],
    providers: [NestJSRxJSRedisService],
    exports: [NestJSRxJSRedisService],
})
export class NestJSRxJSRedisModule {
    static forRootAsync(options: ModuleMetadata): DynamicModule {
        return RedisModule.forRootAsync(options);
    }
}
