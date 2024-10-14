/* eslint-disable max-lines */
import { describe, expect, it, jest } from '@jest/globals';
import { of } from 'rxjs';

import { emptyFn, getErrorMessage } from '@rnw-community/shared';

import { NestJSRxJSRedisService } from './nestjs-rxjs-redis.service';

import type { Redis } from 'ioredis';

const redisKey = 'testKey';
const redisValue = 'testValue';
const redisTTLValue = 100;

type RedisClient = Partial<Pick<Redis, 'del' | 'expire' | 'get' | 'incr' | 'mget' | 'set' | 'ttl'>>;
const getRedisService = (redisClient?: RedisClient): Redis =>
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    ({
        get: jest.fn<Redis['get']>().mockResolvedValue(redisValue),
        set: jest.fn<Redis['set']>().mockResolvedValue('OK'),
        del: jest.fn<Redis['del']>().mockResolvedValue(1),
        mget: jest.fn<Redis['mget']>().mockResolvedValue([redisValue]),
        incr: jest.fn<Redis['incr']>().mockResolvedValue(2),
        ttl: jest.fn<Redis['ttl']>().mockResolvedValue(redisTTLValue),
        expire: jest.fn<Redis['expire']>().mockResolvedValue(1),
        ...redisClient,
    }) as Redis;

// eslint-disable-next-line max-lines-per-function,max-statements
describe('NestJSRxJSRedisService', () => {
    it('get$ operation should create observable', done => {
        expect.assertions(2);

        const get = jest.fn<Redis['get']>().mockResolvedValue(redisValue);
        const redisService = getRedisService({ get });
        const redis = new NestJSRxJSRedisService(redisService);

        redis.get$(redisKey).subscribe(data => {
            expect(get).toHaveBeenCalledWith(redisKey);
            expect(data).toStrictEqual(redisValue);

            done();
        });
    });

    it('get$ operation when redis clinet returns null', done => {
        expect.assertions(2);

        const get = jest.fn<Redis['get']>().mockResolvedValue(null);
        const redisService = getRedisService({ get });
        const redis = new NestJSRxJSRedisService(redisService);

        redis.get$(redisKey).subscribe({
            next: emptyFn,
            error(error: unknown) {
                expect(get).toHaveBeenCalledWith(redisKey);
                expect(getErrorMessage(error)).toBe(`Error getting ${redisKey} from redis`);

                done();
            },
        });
    });

    it('get$ operation when redis client throws error', done => {
        expect.assertions(2);

        const get = jest.fn<Redis['get']>().mockRejectedValue(null);
        const redisService = getRedisService({ get });
        const redis = new NestJSRxJSRedisService(redisService);

        redis.get$(redisKey).subscribe(emptyFn, (error: unknown) => {
            expect(get).toHaveBeenCalledWith(redisKey);
            expect(getErrorMessage(error)).toBe(`Error getting ${redisKey} from redis`);

            done();
        });
    });

    it('set$ operation should create observable', done => {
        expect.assertions(2);

        const set = jest.fn<Redis['set']>().mockResolvedValue('OK');
        const redisService = getRedisService({ set } as unknown as RedisClient);
        const redis = new NestJSRxJSRedisService(redisService);

        redis.set$(redisKey, redisValue, 1).subscribe(data => {
            expect(set).toHaveBeenCalledWith(redisKey, redisValue, 'EX', 1);
            expect(data).toBe(true);

            done();
        });
    });

    it('set$ operation when redis client returns not OK', done => {
        expect.assertions(2);

        const set = jest.fn<Redis['set']>().mockRejectedValue('FAIL');
        const redisService = getRedisService({ set } as unknown as RedisClient);
        const redis = new NestJSRxJSRedisService(redisService);

        redis.set$(redisKey, redisValue, 1).subscribe({
            next: emptyFn,
            error(error: unknown) {
                expect(set).toHaveBeenCalledWith(redisKey, redisValue, 'EX', 1);
                expect(getErrorMessage(error)).toBe(`Error setting ${redisKey} to redis`);

                done();
            },
        });
    });

    it('set$ operation when redis client throws error', done => {
        expect.assertions(2);

        const set = jest.fn<Redis['set']>().mockRejectedValue('FAIL');
        const redisService = getRedisService({ set } as unknown as RedisClient);
        const redis = new NestJSRxJSRedisService(redisService);

        redis.set$(redisKey, redisValue, 1).subscribe({
            next: emptyFn,
            error(error: unknown) {
                expect(set).toHaveBeenCalledWith(redisKey, redisValue, 'EX', 1);
                expect(getErrorMessage(error)).toBe(`Error setting ${redisKey} to redis`);

                done();
            },
        });
    });

    it('del$ operation should create observable', done => {
        expect.assertions(2);

        const del = jest.fn<Redis['del']>().mockResolvedValue(1);
        const redisService = getRedisService({ del } as unknown as RedisClient);
        const redis = new NestJSRxJSRedisService(redisService);

        redis.del$(redisKey).subscribe(data => {
            expect(del).toHaveBeenCalledWith(redisKey);
            expect(data).toBe(1);

            done();
        });
    });

    it('del$ operation when redis client throws error', done => {
        expect.assertions(2);

        const del = jest.fn<Redis['del']>().mockRejectedValue(0);
        const redisService = getRedisService({ del } as unknown as RedisClient);
        const redis = new NestJSRxJSRedisService(redisService);

        redis.del$(redisKey).subscribe({
            next: emptyFn,
            error(error: unknown) {
                expect(del).toHaveBeenCalledWith(redisKey);
                expect(getErrorMessage(error)).toBe(`Error deleting ${redisKey} from redis`);

                done();
            },
        });
    });

    it('mget$ operation should create observable', done => {
        expect.assertions(2);

        const mget = jest.fn<Redis['mget']>().mockResolvedValue([redisValue]);
        const redisService = getRedisService({ mget } as unknown as RedisClient);
        const redis = new NestJSRxJSRedisService(redisService);

        redis.mget$([redisKey]).subscribe(data => {
            expect(mget).toHaveBeenCalledWith(expect.arrayContaining([redisKey]));
            expect(data).toStrictEqual({ [redisKey]: redisValue });

            done();
        });
    });

    it('save operator', done => {
        expect.assertions(3);

        const stringRedisValue = `"${redisValue}"`;

        const set = jest.fn<Redis['set']>().mockResolvedValue('OK');
        const redisService = getRedisService({ set } as unknown as RedisClient);
        const redis = new NestJSRxJSRedisService(redisService);

        // TODO: Check error function
        const errorFn = jest.fn<(input: unknown) => string>().mockReturnValue('Error');
        const toValueFn = jest.fn<(input: unknown) => string>().mockReturnValue(stringRedisValue);

        of(redisValue)
            .pipe(redis.save(() => redisKey, 1, errorFn, toValueFn))
            .subscribe(data => {
                expect(toValueFn).toHaveBeenCalledWith(redisValue);
                expect(set).toHaveBeenCalledWith(redisKey, stringRedisValue, 'EX', 1);
                expect(data).toStrictEqual(redisValue);

                done();
            });
    });

    it('save operator default value JSON.stringify', done => {
        expect.assertions(2);

        const stringRedisValue = `"${redisValue}"`;

        const set = jest.fn<Redis['set']>().mockResolvedValue('OK');
        const redisService = getRedisService({ set } as unknown as RedisClient);
        const redis = new NestJSRxJSRedisService(redisService);

        of(redisValue)
            .pipe(redis.save(() => redisKey, 1))
            .subscribe(data => {
                expect(set).toHaveBeenCalledWith(redisKey, stringRedisValue, 'EX', 1);
                expect(data).toStrictEqual(redisValue);

                done();
            });
    });

    it('load operator', done => {
        expect.assertions(3);

        const stringRedisValue = `"${redisValue}"`;

        const get = jest.fn<Redis['get']>().mockResolvedValue(redisValue);
        const redisService = getRedisService({ get });
        const redis = new NestJSRxJSRedisService(redisService);

        const keyFn = (key: string): string => `${key}-modified`;
        const errorFn = jest.fn<(input: unknown) => string>().mockReturnValue('Error');
        const fromValueFn = jest.fn<(input: unknown) => string>().mockReturnValue(stringRedisValue);

        of(redisKey)
            .pipe(redis.load(keyFn, errorFn, fromValueFn))
            .subscribe(data => {
                expect(get).toHaveBeenCalledWith(keyFn(redisKey));
                expect(fromValueFn).toHaveBeenCalledWith(redisValue, 0);
                expect(data).toStrictEqual(stringRedisValue);

                done();
            });
    });

    it('load operator default value JSON.parse', done => {
        expect.assertions(2);

        const get = jest.fn<Redis['get']>().mockResolvedValue(JSON.stringify(redisValue));
        const redisService = getRedisService({ get });
        const redis = new NestJSRxJSRedisService(redisService);

        of(redisKey)
            .pipe(redis.load())
            .subscribe(data => {
                expect(get).toHaveBeenCalledWith(redisKey);
                expect(data).toStrictEqual(redisValue);

                done();
            });
    });

    it('remove operator', done => {
        expect.assertions(2);

        const del = jest.fn<Redis['del']>().mockResolvedValue(1);
        const redis = new NestJSRxJSRedisService(getRedisService({ del } as unknown as RedisClient));

        const keyFn = (key: string): string => `${key}-modified`;
        const errorFn = jest.fn<(input: unknown) => string>().mockReturnValue('Error');

        of(redisKey)
            .pipe(redis.remove(keyFn, errorFn))
            .subscribe(data => {
                expect(del).toHaveBeenCalledWith(keyFn(redisKey));
                expect(data).toStrictEqual(redisKey);

                done();
            });
    });

    it('remove operator with default value from stream', done => {
        expect.assertions(2);

        const del = jest.fn<Redis['del']>().mockResolvedValue(1);
        const redis = new NestJSRxJSRedisService(getRedisService({ del } as unknown as RedisClient));

        of(redisKey)
            .pipe(redis.remove())
            .subscribe(data => {
                expect(del).toHaveBeenCalledWith(redisKey);
                expect(data).toStrictEqual(redisKey);

                done();
            });
    });

    it('cache operator load existing value', done => {
        expect.assertions(3);

        const stringRedisValue = `"${redisValue}"`;

        const get = jest.fn<Redis['get']>().mockResolvedValue(redisValue);
        const redisService = getRedisService({ get });
        const redis = new NestJSRxJSRedisService(redisService);

        const keyFn = (key: string): string => `${key}-modified`;
        const toValueFn = jest.fn().mockReturnValue(stringRedisValue);

        of(redisKey)
            .pipe(redis.cache(1, () => of(redisValue), keyFn, toValueFn))
            .subscribe(data => {
                expect(get).toHaveBeenCalledWith(keyFn(redisKey));
                expect(data).toStrictEqual(stringRedisValue);
                expect(toValueFn).toHaveBeenCalledWith(redisValue, 0);

                done();
            });
    });

    it('cache operator load existing value with default handlers', done => {
        expect.assertions(2);

        const get = jest.fn<Redis['get']>().mockResolvedValue(redisValue);
        const redisService = getRedisService({ get });
        const redis = new NestJSRxJSRedisService(redisService);

        of(redisKey)
            .pipe(redis.cache(1, () => of(redisValue)))
            .subscribe(data => {
                expect(get).toHaveBeenCalledWith(redisKey);
                expect(data).toStrictEqual(redisValue);

                done();
            });
    });

    it('cache operator prepare and save value', done => {
        expect.assertions(3);

        const stringRedisValue = `"${redisValue}"`;

        const set = jest.fn<Redis['set']>().mockResolvedValue('OK');
        const get = jest.fn<Redis['get']>().mockRejectedValue('');
        const redis = new NestJSRxJSRedisService(getRedisService({ get, set } as unknown as RedisClient));

        const keyFn = (key: string): string => `${key}-modified`;
        const fromValueFn = jest.fn<(input: string) => string>().mockReturnValue(stringRedisValue);
        const toValueFn = jest.fn<(input: unknown) => string>().mockReturnValue(stringRedisValue);

        of(redisKey)
            .pipe(redis.cache(1, () => of(redisValue), keyFn, toValueFn, fromValueFn))
            .subscribe(data => {
                expect(set).toHaveBeenCalledWith(keyFn(redisKey), stringRedisValue, 'EX', 1);
                expect(data).toStrictEqual(redisValue);
                expect(fromValueFn).toHaveBeenCalledWith(redisValue);

                done();
            });
    });

    it('increment value in redis', done => {
        expect.assertions(2);

        const incrValue = 3;
        const incr = jest.fn<Redis['incr']>().mockResolvedValue(incrValue);
        const redis = new NestJSRxJSRedisService(getRedisService({ incr }));

        redis.incr$(redisKey).subscribe(data => {
            expect(incr).toHaveBeenCalledWith(redisKey);
            expect(data).toStrictEqual(incrValue);

            done();
        });
    });

    it('incr$ operation when redis client throws error', done => {
        expect.assertions(2);

        const incr = jest.fn<Redis['incr']>().mockRejectedValue(0);
        const redis = new NestJSRxJSRedisService(getRedisService({ incr }));

        redis.incr$(redisKey, `Error increment ${redisKey} from redis`).subscribe({
            next: emptyFn,
            error(error: unknown) {
                expect(incr).toHaveBeenCalledWith(redisKey);
                expect(getErrorMessage(error)).toBe(`Error increment ${redisKey} from redis`);

                done();
            },
        });
    });

    it('check the remaining time to live of a key that has a timeout', done => {
        expect.assertions(2);

        const ttl = jest.fn<Redis['ttl']>().mockResolvedValue(redisTTLValue);
        const redis = new NestJSRxJSRedisService(getRedisService({ ttl }));

        redis.ttl$(redisKey).subscribe(data => {
            expect(ttl).toHaveBeenCalledWith(redisKey);
            expect(data).toStrictEqual(redisTTLValue);

            done();
        });
    });

    it('ttl$ operation when redis client throws error', done => {
        expect.assertions(2);

        const ttl = jest.fn<Redis['ttl']>().mockRejectedValue(0);
        const redis = new NestJSRxJSRedisService(getRedisService({ ttl }));

        redis.ttl$(redisKey, `Error ttl ${redisKey} from redis`).subscribe({
            next: emptyFn,
            error(error: unknown) {
                expect(ttl).toHaveBeenCalledWith(redisKey);
                expect(getErrorMessage(error)).toBe(`Error ttl ${redisKey} from redis`);

                done();
            },
        });
    });

    it('setting timeout for key', done => {
        expect.assertions(2);

        const expire = jest.fn<Redis['expire']>().mockResolvedValue(1);
        const redis = new NestJSRxJSRedisService(getRedisService({ expire } as unknown as RedisClient));

        redis.expire$(redisKey, redisTTLValue).subscribe(data => {
            expect(expire).toHaveBeenCalledWith(redisKey, redisTTLValue);
            expect(data).toBe(1);

            done();
        });
    });

    it('expire$ operation when redis client throws error', done => {
        expect.assertions(2);

        const expire = jest.fn<Redis['expire']>().mockRejectedValue(0);
        const redis = new NestJSRxJSRedisService(getRedisService({ expire } as unknown as RedisClient));

        redis.expire$(redisKey, redisTTLValue, `Error setting timeout for ${redisKey} in redis`).subscribe({
            next: emptyFn,
            error(error: unknown) {
                expect(expire).toHaveBeenCalledWith(redisKey, redisTTLValue);
                expect(getErrorMessage(error)).toBe(`Error setting timeout for ${redisKey} in redis`);

                done();
            },
        });
    });
});
