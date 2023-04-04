/* eslint-disable jest/no-untyped-mock-factory,jest/no-done-callback */
import { of } from 'rxjs';

import { emptyFn } from '@rnw-community/shared';

import { type NestJSRxJSLockModuleOptions, defaultNestJSRxJSLockModuleOptions } from '../nestjs-rxjs-lock-module.options';

import { NestJSRxJSLockService } from './nestjs-rxjs-lock.service';

import type { RedisService } from 'nestjs-redis';

jest.mock('nestjs-redis', () =>
    jest.fn().mockImplementation(() => ({
        getClients: jest.fn(() => new Map([['default', {}]])),
    }))
);

const mockUnlock = jest.fn();
const mockAcquire = jest.fn().mockResolvedValue({
    unlock: mockUnlock,
    expiration: 1,
});
jest.mock('redlock', () =>
    jest.fn().mockImplementation(() => ({
        acquire: mockAcquire,
        unlock: mockUnlock,
    }))
);
enum LockCodesEnum {
    DB_CREATE_USER = 'DB_CREATE_USER',
}

class LockService extends NestJSRxJSLockService<LockCodesEnum> {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(redisService: RedisService, options: NestJSRxJSLockModuleOptions) {
        super(redisService, options);
    }
}

const getRedisService = (): RedisService =>
    ({ getClients: jest.fn(() => new Map([['default', {}]])) } as unknown as RedisService);

describe('nestJSRxJSLockService', () => {
    describe('lock$', () => {
        it('should acquire and release a lock with correct key', done => {
            expect.assertions(3);

            const nestJSRxJSLockService = new LockService(getRedisService(), defaultNestJSRxJSLockModuleOptions);
            const handler$ = jest.fn(() => of(true));

            nestJSRxJSLockService.lock$('test', LockCodesEnum.DB_CREATE_USER, handler$).subscribe(emptyFn, emptyFn, () => {
                expect(mockAcquire).toHaveBeenCalledWith(
                    [`lock:${LockCodesEnum.DB_CREATE_USER}:test`],
                    defaultNestJSRxJSLockModuleOptions.defaultExpireMs
                );
                expect(handler$).toHaveBeenCalledWith();
                expect(mockUnlock).toHaveBeenCalledWith();
                done();
            });
        });

        it('should re-throw an error thrown by the lock acquiring', done => {
            expect.assertions(3);
            jest.clearAllMocks();

            const nestJSRxJSLockService = new LockService(getRedisService(), defaultNestJSRxJSLockModuleOptions);
            const handler$ = jest.fn(() => of(true));

            const acquireErrorText = 'Lock failed';
            mockAcquire.mockRejectedValueOnce(new Error(acquireErrorText));

            nestJSRxJSLockService.lock$('test', LockCodesEnum.DB_CREATE_USER, handler$).subscribe(
                done,
                (e: unknown) => {
                    expect((e as string).toString()).toBe(`Error: Lock failed`);
                    expect(handler$).toHaveBeenCalledTimes(0);
                    expect(mockUnlock).toHaveBeenCalledTimes(0);
                    done();
                },
                done
            );
        });
    });
});
