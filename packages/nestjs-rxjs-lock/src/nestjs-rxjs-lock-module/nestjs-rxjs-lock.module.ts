// eslint-disable-next-line max-classes-per-file
import { type DynamicModule, Injectable, Module, type Type } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

import { type NestJSRxJSLockModuleOptions, defaultNestJSRxJSLockModuleOptions } from '../nestjs-rxjs-lock-module.options';
import { NestJSRxJSLockService } from '../nestjs-rxjs-lock-service/nestjs-rxjs-lock.service';

/**
 * The NestJS module factory providing a Redis-backed RxJS lock service typed by a lock-prefix enum.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-lock/readme.md#nestjsrxjslockmodule
 */
@Module({})
export class NestJSRxJSLockModule {
    /**
     * Returns a `[module, service]` tuple whose injectable `NestJSRxJSLockService` subclass is typed by the lock-prefix enum `E`.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-lock/readme.md#nestjsrxjslockmoduleregistertypedasync
     */
    static registerTypedAsync<E = string>(
        options: Partial<NestJSRxJSLockModuleOptions> = {}
    ): [DynamicModule, Type<NestJSRxJSLockService<E>>] {
        @Injectable()
        class LockService extends NestJSRxJSLockService<E> {
            constructor(redis: Redis) {
                super(redis, { ...defaultNestJSRxJSLockModuleOptions, ...options });
            }
        }

         
        const LockModule = {
            imports: [RedisModule],
            module: NestJSRxJSLockModule,
            providers: [LockService],
            exports: [LockService],
        };

        return [LockModule, LockService];
    }
}
