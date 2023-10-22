import { NestJSRxJSLoggerModule } from './nestjs-rxjs-logger.module';

describe('NestJSRxJSLoggerModule', () => {
    it('should create a module', () => {
        expect.hasAssertions();

        expect(new NestJSRxJSLoggerModule()).toBeTruthy();
    });
});
