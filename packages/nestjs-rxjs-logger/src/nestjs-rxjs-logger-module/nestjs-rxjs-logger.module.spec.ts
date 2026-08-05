import { describe, expect, it } from '@jest/globals';

import { NestJSRxJSLoggerModule } from './nestjs-rxjs-logger.module.js';

describe('NestJSRxJSLoggerModule', () => {
    it('should create a module', () => {
        expect.hasAssertions();

        expect(new NestJSRxJSLoggerModule()).toBeTruthy();
    });
});
