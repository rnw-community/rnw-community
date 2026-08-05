import { describe, expect, it } from '@jest/globals';

import { NestJSRxJSLockService } from '../nestjs-rxjs-lock-service/nestjs-rxjs-lock.service.js';

import { NestJSRxJSLockModule } from './nestjs-rxjs-lock.module.js';

describe('NestJSRxJSLockModule', () => {
    it('should registerTypedAsync', () => {
        expect.hasAssertions();

         
        const [module, Service] = NestJSRxJSLockModule.registerTypedAsync();

        expect(module).toBeTruthy();
        expect(new Service() instanceof NestJSRxJSLockService).toBeTruthy();
    });
});
