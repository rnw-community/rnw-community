 
import { describe, expect, it, jest } from '@jest/globals';
import { of } from 'rxjs';

import { emptyFn, getErrorMessage } from '@rnw-community/shared';

import { type NestJSRxJSLockModuleOptions, defaultNestJSRxJSLockModuleOptions } from '../nestjs-rxjs-lock-module.options';

import { NestJSRxJSLockService } from './nestjs-rxjs-lock.service';

import type Redis from 'ioredis';

const mockRelease = jest.fn<() => Promise<boolean>>().mockResolvedValue(true);
const mockAcquire = jest
    .fn<() => Promise<{ release: () => Promise<boolean> }>>()
    .mockResolvedValue({ release: mockRelease });

jest.mock('redlock', () =>
    jest.fn().mockImplementation(() => ({
        acquire: mockAcquire,
        release: mockRelease,
    }))
);
enum LockCodesEnum {
    DB_CREATE_USER = 'DB_CREATE_USER',
}

class LockService extends NestJSRxJSLockService<LockCodesEnum> {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(redisService: Redis, options: NestJSRxJSLockModuleOptions) {
        super(redisService, options);
    }
}

const getRedisService = (): Redis => jest.fn() as unknown as Redis;

describe('nestJSRxJSLockService', () => {
    describe('lock$', () => {
        it('should acquire and release a lock with correct key', done => {
            expect.assertions(3);

            const nestJSRxJSLockService = new LockService(getRedisService(), defaultNestJSRxJSLockModuleOptions);
            const handler$ = jest.fn(() => of(true));

            nestJSRxJSLockService.lock$('test', LockCodesEnum.DB_CREATE_USER, handler$).subscribe({
                next: emptyFn,
                error: emptyFn,
                complete: () => {
                    expect(mockAcquire).toHaveBeenCalledWith(
                        [`lock:${LockCodesEnum.DB_CREATE_USER}:test`],
                        defaultNestJSRxJSLockModuleOptions.defaultExpireMs
                    );
                    expect(handler$).toHaveBeenCalledWith();
                    expect(mockRelease).toHaveBeenCalledWith();

                    done();
                },
            });
        });

        it('should re-throw an error thrown by the lock acquiring', done => {
            expect.assertions(3);

            jest.clearAllMocks();

            const nestJSRxJSLockService = new LockService(getRedisService(), defaultNestJSRxJSLockModuleOptions);
            const handler$ = jest.fn(() => of(true));

            const acquireErrorText = 'Lock failed';
            mockAcquire.mockRejectedValueOnce(new Error(acquireErrorText));

            nestJSRxJSLockService.lock$('test', LockCodesEnum.DB_CREATE_USER, handler$).subscribe({
                next: () => void done(),
                error: (e: unknown) => {
                    expect(getErrorMessage(e)).toBe(acquireErrorText);
                    expect(handler$).toHaveBeenCalledTimes(0);
                    expect(mockRelease).toHaveBeenCalledTimes(0);

                    done();
                },
                complete: done,
            });
        });

        it('should silence lock release error', done => {
            expect.assertions(2);

            jest.clearAllMocks();

            const nestJSRxJSLockService = new LockService(getRedisService(), defaultNestJSRxJSLockModuleOptions);
            const handler$ = jest.fn(() => of(true));

            const releaseErrorText = 'Lock failed';
            mockRelease.mockRejectedValue(new Error(releaseErrorText));

            nestJSRxJSLockService.lock$('test', LockCodesEnum.DB_CREATE_USER, handler$).subscribe({
                next: emptyFn,
                error: emptyFn,
                complete: () => {
                    expect(handler$).toHaveBeenCalledWith();
                    expect(mockRelease).toHaveBeenCalledWith();

                    done();
                },
            });
        });
    });
});
