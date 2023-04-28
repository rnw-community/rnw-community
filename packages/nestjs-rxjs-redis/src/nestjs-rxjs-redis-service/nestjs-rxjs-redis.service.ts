import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
// eslint-disable-next-line @typescript-eslint/no-import-type-side-effects
import { type Redis } from 'ioredis';
import { catchError, concatMap, from, map, of, throwError } from 'rxjs';

import { isDefined } from '@rnw-community/shared';

import type { MonoTypeOperatorFunction, Observable, OperatorFunction } from 'rxjs';

@Injectable()
export class NestJSRxJSRedisService {
    constructor(@InjectRedis() private readonly redisClient: Redis) {}

    /**
     * RxJS wrapper for redis set operation.
     *
     * @see https://redis.io/commands/set
     *
     * @param key Redis key
     * @param value Value for setting
     * @param ttlInSeconds Time to live in seconds
     * @param error Error string
     * @returns Observable<boolean> with operation success status
     */
    set$(key: string, value: string, ttlInSeconds: number, error = `Error setting ${key} to redis`): Observable<boolean> {
        return from(this.redisClient.set(key, value, 'EX', ttlInSeconds)).pipe(
            map(() => true),
            catchError(() => throwError(() => new Error(error)))
        );
    }

    /**
     * RxJS wrapper for redis get operation.
     *
     * @see https://redis.io/commands/get
     *
     * @param key Redis key
     * @param error Error string
     * @returns Observable<string> Value from redis
     */
    get$(key: string, error = `Error getting ${key} from redis`): Observable<string> {
        return from(this.redisClient.get(key)).pipe(
            concatMap(res => (isDefined(res) ? of(res) : throwError(() => new Error(error)))),
            catchError(() => throwError(() => new Error(error)))
        );
    }

    /**
     * RxJS wrapper for redis del operation.
     *
     * TODO: Think if we need to throw error if 0 items were deleted?
     * @see https://redis.io/commands/del
     *
     * @param key Redis key
     * @param error Error string
     * @returns Observable<number> Number of keys deleted from redis
     */
    del$(key: string, error = `Error deleting ${key} from redis`): Observable<number> {
        return from(this.redisClient.del(key)).pipe(catchError(() => throwError(() => new Error(error))));
    }

    /**
     * RxJS wrapper for redis mget operation.
     *
     * @see https://redis.io/commands/mget
     *
     * @param keys Array of keys
     * @returns Observable<Record<K, string|null>> Object with key:value
     */
    mget$<K extends string>(keys: K[]): Observable<Record<K, string | null>> {
        return from(this.redisClient.mget(keys)).pipe(
            map(results =>
                results.reduce<Record<string, string | null>>((prev, cur, idx) => ({ ...prev, [keys[idx]]: cur }), {})
            )
        );
    }

    /**
     * RxJS operator for saving data into redis.
     *
     * This operator receives a value from RxJS stream, passes it to keyFn handler for
     * generating data-related redis key and converts data to string using toValueFn and.
     * saves this string to redis.
     *
     * @see set$
     *
     * @param keyFn Handler for generating redis key
     * @param ttlInSeconds Time to live in seconds
     * @param errorFn Handler for generating saving error message
     * @param toValueFn Handler for converting value to string before saving
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
     * RxJS operator for loading data from redis
     *
     * This operator receives a key from RxJS stream, passes it to keyFn handler for
     * generating redis key, retrieves a key from redis and converts data from string using fromValueFn.
     *
     * @see get$
     *
     * @param keyFn Handler for generating redis key
     * @param errorFn Handler for generating saving error message
     * @param fromValueFn Handler for converting value from string after getting
     */
    load<O, I = string>(
        keyFn: (input: I) => string = key => `${String(key)}`,
        errorFn: (input: I) => string = input => `Error loading "${keyFn(input)}" from redis`,
        fromValueFn: (input: string) => O = input => JSON.parse(input) as O
    ): OperatorFunction<I, O> {
        return (source$: Observable<I>): Observable<O> =>
            source$.pipe(concatMap(input => this.get$(keyFn(input), errorFn(input)).pipe(map(fromValueFn))));
    }

    /**
     * RxJS operator for deleting data from redis
     *
     * This operator receives a key from RxJS stream, passes it to keyFn handler for
     * generating redis key and deletes a key in redis.
     *
     * @see del$
     *
     * @param keyFn Handler for generating redis key
     * @param errorFn Handler for generating saving error message
     */
    remove<T>(
        keyFn: (input: T) => string = key => `${String(key)}`,
        errorFn: (input: T) => string = input => `Error removing "${keyFn(input)}" from redis`
    ): MonoTypeOperatorFunction<T> {
        return (source$: Observable<T>): Observable<T> =>
            source$.pipe(concatMap(input => this.del$(keyFn(input), errorFn(input)).pipe(map(() => input))));
    }

    /**
     * RxJS operator for common cache operation.
     *
     * This operator loads data from redis and if data is not available
     * executes prepareFn$ handler and saves returned data to redis.
     *
     * @see get$
     * @see set$
     *
     * @param prepareFn$ Handler for getting/preparing data
     * @param keyFn Redis key generation callback, by default takes input stream and uses emitted value as a key
     * @param ttlInSeconds Time to live in seconds
     * @param fromValueFn Handler for converting string data received from redis, JSON.parse by default
     * @param toValueFn Handler for converting data to string for storage in redis, JSON.stringify by default
     *
     * @returns OperatorFunction RxJS operator
     */
    // eslint-disable-next-line max-params
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
