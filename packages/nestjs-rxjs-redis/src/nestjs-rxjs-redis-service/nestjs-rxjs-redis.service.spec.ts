import { of } from 'rxjs';

import { NestJSRxJSRedisService } from './nestjs-rxjs-redis.service';

import type IORedis from 'ioredis';
import type { RedisService } from 'nestjs-redis';

const redisKey = 'testKey';
const redisValue = 'testValue';

const getRedisService = (redisClient?: Partial<Pick<IORedis.Redis, 'del' | 'get' | 'mget' | 'set'>>): RedisService =>
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    ({
        getClient: () => ({
            get: jest.fn().mockResolvedValue(redisValue),
            set: jest.fn().mockResolvedValue('OK'),
            del: jest.fn().mockResolvedValue(1),
            mget: jest.fn().mockResolvedValue([redisValue]),
            ...redisClient,
        }),
    } as RedisService);

// eslint-disable-next-line max-lines-per-function,max-statements
describe('nestJSRxJSRedisService', () => {
    it('get$ operation should create observable', () =>
        new Promise(resolve => {
            expect.assertions(2);

            const get = jest.fn().mockResolvedValue(redisValue);
            const redisService = getRedisService({ get });
            const redis = new NestJSRxJSRedisService(redisService);

            redis.get$(redisKey).subscribe(data => {
                expect(get).toHaveBeenCalledWith(redisKey);
                expect(data).toStrictEqual(redisValue);
                resolve(true);
            });
        }));

    it('set$ operation should create observable', () =>
        new Promise(resolve => {
            expect.assertions(2);

            const set = jest.fn().mockResolvedValue('OK');
            const redisService = getRedisService({ set });
            const redis = new NestJSRxJSRedisService(redisService);

            redis.set$(redisKey, redisValue, 1).subscribe(data => {
                expect(set).toHaveBeenCalledWith(redisKey, redisValue, 'EX', 1);
                expect(data).toStrictEqual(true);
                resolve(true);
            });
        }));

    it('del$ operation should create observable', () =>
        new Promise(resolve => {
            expect.assertions(2);

            const del = jest.fn().mockResolvedValue(1);
            const redisService = getRedisService({ del });
            const redis = new NestJSRxJSRedisService(redisService);

            redis.del$(redisKey).subscribe(data => {
                expect(del).toHaveBeenCalledWith(redisKey);
                expect(data).toStrictEqual(1);
                resolve(true);
            });
        }));

    it('mget$ operation should create observable', () =>
        new Promise(resolve => {
            expect.assertions(2);

            const mget = jest.fn().mockResolvedValue([redisValue]);
            const redisService = getRedisService({ mget });
            const redis = new NestJSRxJSRedisService(redisService);

            redis.mget$([redisKey]).subscribe(data => {
                expect(mget).toHaveBeenCalledWith(expect.arrayContaining([redisKey]));
                expect(data).toStrictEqual({ [redisKey]: redisValue });
                resolve(true);
            });
        }));

    it('save operator', () =>
        new Promise(resolve => {
            expect.assertions(3);

            const stringRedisValue = `"${redisValue}"`;

            const set = jest.fn().mockResolvedValue('OK');
            const redisService = getRedisService({ set });
            const redis = new NestJSRxJSRedisService(redisService);

            // TODO: Check error function
            const errorFn = jest.fn().mockReturnValue('Error');
            const toValueFn = jest.fn().mockReturnValue(stringRedisValue);

            of(redisValue)
                .pipe(redis.save(() => redisKey, 1, errorFn, toValueFn))
                .subscribe(data => {
                    expect(toValueFn).toHaveBeenCalledWith(redisValue);
                    expect(set).toHaveBeenCalledWith(redisKey, stringRedisValue, 'EX', 1);
                    expect(data).toStrictEqual(redisValue);
                    resolve(true);
                });
        }));

    it('save operator default value JSON.stringify', () =>
        new Promise(resolve => {
            expect.assertions(2);

            const stringRedisValue = `"${redisValue}"`;

            const set = jest.fn().mockResolvedValue('OK');
            const redisService = getRedisService({ set });
            const redis = new NestJSRxJSRedisService(redisService);

            of(redisValue)
                .pipe(redis.save(() => redisKey, 1))
                .subscribe(data => {
                    expect(set).toHaveBeenCalledWith(redisKey, stringRedisValue, 'EX', 1);
                    expect(data).toStrictEqual(redisValue);
                    resolve(true);
                });
        }));

    it('load operator', () =>
        new Promise(resolve => {
            expect.assertions(3);

            const stringRedisValue = `"${redisValue}"`;

            const get = jest.fn().mockResolvedValue(redisValue);
            const redisService = getRedisService({ get });
            const redis = new NestJSRxJSRedisService(redisService);

            const keyFn = (key: string): string => `${key}-modified`;
            const errorFn = jest.fn().mockReturnValue('Error');
            const fromValueFn = jest.fn().mockReturnValue(stringRedisValue);

            of(redisKey)
                .pipe(redis.load(keyFn, errorFn, fromValueFn))
                .subscribe(data => {
                    expect(get).toHaveBeenCalledWith(keyFn(redisKey));
                    expect(fromValueFn).toHaveBeenCalledWith(redisValue, 0);
                    expect(data).toStrictEqual(stringRedisValue);
                    resolve(true);
                });
        }));

    it('load operator default value JSON.parse', () =>
        new Promise(resolve => {
            expect.assertions(2);

            const get = jest.fn().mockResolvedValue(JSON.stringify(redisValue));
            const redisService = getRedisService({ get });
            const redis = new NestJSRxJSRedisService(redisService);

            of(redisKey)
                .pipe(redis.load())
                .subscribe(data => {
                    expect(get).toHaveBeenCalledWith(redisKey);
                    expect(data).toStrictEqual(redisValue);
                    resolve(true);
                });
        }));

    it('remove operator', () =>
        new Promise(resolve => {
            expect.assertions(2);

            const del = jest.fn().mockResolvedValue(1);
            const redis = new NestJSRxJSRedisService(getRedisService({ del }));

            const keyFn = (key: string): string => `${key}-modified`;
            const errorFn = jest.fn().mockReturnValue('Error');

            of(redisKey)
                .pipe(redis.remove(keyFn, errorFn))
                .subscribe(data => {
                    expect(del).toHaveBeenCalledWith(keyFn(redisKey));
                    expect(data).toStrictEqual(redisKey);
                    resolve(true);
                });
        }));

    it('remove operator with default value from stream', () =>
        new Promise(resolve => {
            expect.assertions(2);

            const del = jest.fn().mockResolvedValue(1);
            const redis = new NestJSRxJSRedisService(getRedisService({ del }));

            of(redisKey)
                .pipe(redis.remove())
                .subscribe(data => {
                    expect(del).toHaveBeenCalledWith(redisKey);
                    expect(data).toStrictEqual(redisKey);
                    resolve(true);
                });
        }));

    it('cache operator load existing value', () =>
        new Promise(resolve => {
            expect.assertions(3);

            const stringRedisValue = `"${redisValue}"`;

            const get = jest.fn().mockResolvedValue(redisValue);
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
                    resolve(true);
                });
        }));

    it('cache operator load existing value with default handlers', () =>
        new Promise(resolve => {
            expect.assertions(2);

            const get = jest.fn().mockResolvedValue(redisValue);
            const redisService = getRedisService({ get });
            const redis = new NestJSRxJSRedisService(redisService);

            of(redisKey)
                .pipe(redis.cache(1, () => of(redisValue)))
                .subscribe(data => {
                    expect(get).toHaveBeenCalledWith(redisKey);
                    expect(data).toStrictEqual(redisValue);
                    resolve(true);
                });
        }));

    it('cache operator prepare and save value', () =>
        new Promise(resolve => {
            expect.assertions(3);

            const stringRedisValue = `"${redisValue}"`;

            const set = jest.fn().mockResolvedValue('OK');
            const get = jest.fn().mockRejectedValue('');
            const redis = new NestJSRxJSRedisService(getRedisService({ get, set }));

            const keyFn = (key: string): string => `${key}-modified`;
            const fromValueFn = jest.fn().mockReturnValue(stringRedisValue);
            const toValueFn = jest.fn().mockReturnValue(stringRedisValue);

            of(redisKey)
                .pipe(redis.cache(1, () => of(redisValue), keyFn, toValueFn, fromValueFn))
                .subscribe(data => {
                    expect(set).toHaveBeenCalledWith(keyFn(redisKey), stringRedisValue, 'EX', 1);
                    expect(data).toStrictEqual(redisValue);
                    expect(fromValueFn).toHaveBeenCalledWith(redisValue);
                    resolve(true);
                });
        }));
});
