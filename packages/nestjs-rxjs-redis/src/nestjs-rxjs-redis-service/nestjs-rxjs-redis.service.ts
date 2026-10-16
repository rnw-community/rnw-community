import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { catchError, concatMap, from, map, of, throwError } from 'rxjs';

import { isDefined } from '@rnw-community/shared';

import type { MonoTypeOperatorFunction, Observable, OperatorFunction } from 'rxjs';

/**
 * A NestJS service wrapping ioredis commands and caching patterns as RxJS streams and operators.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-redis/readme.md#nestjsrxjsredisservice
 */
@Injectable()
export class NestJSRxJSRedisService {
    constructor(@InjectRedis() private readonly redisClient: Redis) {}

    /**
     * Stores `value` under `key` with a TTL in seconds, emitting `true` or erroring with `error`.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-redis/readme.md#basic-operations
     */
    set$(key: string, value: string, ttlInSeconds: number, error = `Error setting ${key} to redis`): Observable<boolean> {
        return from(this.redisClient.set(key, value, 'EX', ttlInSeconds)).pipe(
            map(() => true),
            catchError(() => throwError(() => new Error(error)))
        );
    }

    /**
     * Reads the value stored under `key`, erroring with `error` when the key is missing or the command fails.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-redis/readme.md#basic-operations
     */
    get$(key: string, error = `Error getting ${key} from redis`): Observable<string> {
        return from(this.redisClient.get(key)).pipe(
            concatMap(res => (isDefined(res) ? of(res) : throwError(() => new Error(error)))),
            catchError(() => throwError(() => new Error(error)))
        );
    }

    /**
     * Deletes `key`, emitting the number of removed keys or erroring with `error`.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-redis/readme.md#basic-operations
     */
    del$(key: string, error = `Error deleting ${key} from redis`): Observable<number> {
        return from(this.redisClient.del(key)).pipe(catchError(() => throwError(() => new Error(error))));
    }

    /**
     * Reads the remaining TTL of `key` in seconds, erroring with `error` when the command fails.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-redis/readme.md#basic-operations
     */
    ttl$(key: string, error = `Error ttl ${key} from redis`): Observable<number> {
        return from(this.redisClient.ttl(key)).pipe(catchError(() => throwError(() => new Error(error))));
    }

    /**
     * Sets a TTL in seconds on `key`, erroring with `error` when the command fails.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-redis/readme.md#basic-operations
     */
    expire$(key: string, seconds: number | string, error = `Error setting timeout for ${key} in redis`): Observable<number> {
        return from(this.redisClient.expire(key, seconds)).pipe(catchError(() => throwError(() => new Error(error))));
    }

    /**
     * Increments the integer stored under `key`, emitting the new value or erroring with `error`.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-redis/readme.md#basic-operations
     */
    incr$(key: string, error = `Error increment ${key} from redis`): Observable<number> {
        return from(this.redisClient.incr(key)).pipe(catchError(() => throwError(() => new Error(error))));
    }

    /**
     * Reads several keys at once, emitting a record of each key to its value or `null`.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-redis/readme.md#basic-operations
     */
    mget$<K extends string>(keys: K[]): Observable<Record<K, string | null>> {
        return from(this.redisClient.mget(keys)).pipe(
            map(results =>
                results.reduce<Record<string, string | null>>((prev, cur, idx) => ({ ...prev, [keys[idx]]: cur }), {})
            )
        );
    }

    /**
     * Pipeable operator storing each emitted value under a key derived from it and passing the value through.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-redis/readme.md#save
     */
    save<T>(
        keyFn: (input: T) => string,
        ttlInSeconds: number,
        errorFn: (input: T) => string = input => `Error saving "${keyFn(input)}" to redis "${JSON.stringify(input)}"`,
        toValueFn: (input: T) => string = input => JSON.stringify(input)
    ): MonoTypeOperatorFunction<T> {
        return (source$: Observable<T>): Observable<T> =>
            source$.pipe(
                concatMap(input =>
                    this.set$(keyFn(input), toValueFn(input), ttlInSeconds, errorFn(input)).pipe(map(() => input))
                )
            );
    }

    /**
     * Pipeable operator mapping each emitted key input to the value loaded and deserialized from Redis.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-redis/readme.md#load
     */
    load<O, I = string>(
        keyFn: (input: I) => string = key => String(key),
        errorFn: (input: I) => string = input => `Error loading "${keyFn(input)}" from redis`,

        fromValueFn: (input: string) => O = input => JSON.parse(input) as O
    ): OperatorFunction<I, O> {
        return (source$: Observable<I>): Observable<O> =>
            source$.pipe(concatMap(input => this.get$(keyFn(input), errorFn(input)).pipe(map(fromValueFn))));
    }

    /**
     * Pipeable operator deleting the key derived from each emitted value and passing the value through.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-redis/readme.md#remove
     */
    remove<T>(
        keyFn: (input: T) => string = key => String(key),
        errorFn: (input: T) => string = input => `Error removing "${keyFn(input)}" from redis`
    ): MonoTypeOperatorFunction<T> {
        return (source$: Observable<T>): Observable<T> =>
            source$.pipe(concatMap(input => this.del$(keyFn(input), errorFn(input)).pipe(map(() => input))));
    }

    /**
     * Pipeable operator emitting the cached value for each input's key, or computing it with `prepareFn$` and caching it with a TTL on a miss.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-redis/readme.md#cache
     */
    // eslint-disable-next-line @typescript-eslint/max-params
    cache<R, T = string>(
        ttlInSeconds: number,
        prepareFn$: (input: string) => Observable<R>,
        keyFn: (input: T) => string = input => String(input),

        fromValueFn: (input: string) => R = input => JSON.parse(input) as R,
        toValueFn: (input: R) => string = input => JSON.stringify(input)
    ): OperatorFunction<T, R> {
        return (source$: Observable<T>): Observable<R> =>
            source$.pipe(
                concatMap(input => {
                    const key = keyFn(input);

                    return this.get$(key).pipe(
                        map(fromValueFn),
                        catchError(() =>
                            prepareFn$(key).pipe(
                                concatMap(data => this.set$(key, toValueFn(data), ttlInSeconds).pipe(map(() => data)))
                            )
                        )
                    );
                })
            );
    }
}
