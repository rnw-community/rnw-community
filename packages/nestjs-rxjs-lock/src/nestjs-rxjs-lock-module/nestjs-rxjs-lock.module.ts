// eslint-disable-next-line max-classes-per-file
import { type DynamicModule, Injectable, Module, type Type } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

import { type NestJSRxJSLockModuleOptions, defaultNestJSRxJSLockModuleOptions } from '../nestjs-rxjs-lock-module.options';
import { NestJSRxJSLockService } from '../nestjs-rxjs-lock-service/nestjs-rxjs-lock.service';

@Module({})
export class NestJSRxJSLockModule {
    static registerTypedAsync<E = string>(
        options: Partial<NestJSRxJSLockModuleOptions> = {}
    ): [DynamicModule, Type<NestJSRxJSLockService<E>>] {
        @Injectable()
        class LockService extends NestJSRxJSLockService<E> {
            constructor(redis: Redis) {
                super(redis, { ...defaultNestJSRxJSLockModuleOptions, ...options });
            }
        }

        // eslint-disable-next-line @typescript-eslint/naming-convention
        const LockModule = {
            imports: [RedisModule],
            module: NestJSRxJSLockModule,
            providers: [LockService],
            exports: [LockService],
        };

        return [LockModule, LockService];
    }
}
