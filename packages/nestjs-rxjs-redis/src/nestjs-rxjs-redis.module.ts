import { Module } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';

import { NestJSRxJSRedisService } from './nestjs-rxjs-redis-service/nestjs-rxjs-redis.service';

@Module({
    imports: [RedisModule],
    providers: [NestJSRxJSRedisService],
    exports: [NestJSRxJSRedisService],
})
export class NestJSRxJSRedisModule {}
