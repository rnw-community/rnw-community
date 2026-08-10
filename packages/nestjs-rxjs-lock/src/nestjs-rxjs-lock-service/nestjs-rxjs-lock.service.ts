import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import Redlock from 'redlock';
import { type Observable, concatMap, finalize, from } from 'rxjs';

import { isNotEmptyString } from '@rnw-community/shared';

import type { NestJSRxJSLockModuleOptions } from '../nestjs-rxjs-lock-module.options';

export abstract class NestJSRxJSLockService<E = string> {
    private readonly lock: Redlock;
    private readonly expireInMs: number;

    protected constructor(
        @InjectRedis() readonly redis: Redis,
        readonly options: NestJSRxJSLockModuleOptions
    ) {
        const { defaultExpireMs, ...redlockOptions } = options;
        this.expireInMs = options.defaultExpireMs;

        this.lock = new Redlock([redis], redlockOptions);
    }

    lock$<T>(name: string, prefix: E, handler$: () => Observable<T>, expireInMs = this.expireInMs): Observable<T> {
        const lockName = NestJSRxJSLockService.generateName(name, prefix);

        return from(this.lock.acquire([lockName], expireInMs)).pipe(
            concatMap(lock => handler$().pipe(finalize(() => void lock.release().catch(() => void 0))))
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    private static generateName<E>(name: string, prefix: E): string {
        return ['lock', prefix, name].filter(isNotEmptyString).join(':');
    }
}
