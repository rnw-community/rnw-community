/* eslint-disable @typescript-eslint/unbound-method,class-methods-use-this,@typescript-eslint/class-methods-use-this */
import { describe, expect, it, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';

import { Log } from './log.decorator';

const preLogText = 'testPreLog';
const postLogText = 'testPostLog';
const errorLogText = 'testErrorLog';

class TestClass {
    readonly field = 1;

    @Log(preLogText, postLogText)
    testStrings(): number {
        return this.field;
    }

    @Log(preLogText)
    testNoPostLogArg(): number {
        return this.field;
    }

    @Log(preLogText, postLogText)
    testPromiseStrings(): Promise<number> {
        return Promise.resolve(this.field);
    }

    @Log(preLogText)
    testPromiseNoPostLog(): Promise<number> {
        return Promise.resolve(this.field);
    }

    @Log(preLogText, postLogText, errorLogText)
    // eslint-disable-next-line @typescript-eslint/require-await
    async testPromiseError(): Promise<number> {
        throw new Error(errorLogText);
    }

    @Log(preLogText, postLogText, (error, arg) => `${String(error)}-${arg}`)
    // eslint-disable-next-line @typescript-eslint/require-await
    async testPromiseErrorFunction(_arg: number): Promise<number> {
        throw new Error(errorLogText);
    }

    @Log(preLogText, (result, arg) => `${result}-${postLogText}-${arg}`)
    testObservableStrings(arg: number): Observable<number> {
        return of(arg + this.field);
    }

    @Log(preLogText)
    testObservableNoPostLog(arg: number): Observable<number> {
        return of(arg + this.field);
    }

    @Log(arg => `${preLogText}-${arg}`, (result, arg) => `${result}-${postLogText}-${arg}`)
    testFunctions(arg: number): number {
        return arg + this.field;
    }

    @Log(preLogText, postLogText, errorLogText)
    testErrorString(_arg: number): number {
        throw new Error(errorLogText);
    }

    @Log(preLogText, postLogText, (error, arg) => `${String(error)}-${errorLogText}-${arg}`)
    testErrorFunction(_arg: number): number {
        throw new Error(errorLogText);
    }

    @Log(preLogText, postLogText)
    testNoErrorArg(_arg: number): number {
        throw new Error(errorLogText);
    }

    @Log(preLogText, postLogText, errorLogText)
    testObservableError(): Observable<string> {
        return throwError(() => errorLogText);
    }

    @Log(preLogText, postLogText, (error, arg) => `${String(error)}-${arg}`)
    testObservableErrorArg(_arg: number): Observable<string> {
        return throwError(() => errorLogText);
    }

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    @Log(arg => `${preLogText}-${arg}`, (result, arg) => `${result}-${postLogText}-${arg}`)
    testGeneric<T>(arg: T): T {
        return arg;
    }

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    @Log(arg => `${preLogText}-${arg}`, (result, arg) => `${result}-${postLogText}-${arg}`)
    async testGenericPromise<T>(arg: T): Promise<T> {
        return await arg;
    }

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    @Log(arg => `${preLogText}-${arg}`, (result, arg) => `${result}-${postLogText}-${arg}`)
    testGenericObservable<T>(arg: T): Observable<T> {
        return of(arg);
    }
}

jest.mock('@nestjs/common', () => ({
    Logger: {
        log: jest.fn(),
        debug: jest.fn(),
        error: jest.fn(),
    },
}));

// eslint-disable-next-line max-lines-per-function
describe('LogDecorator', () => {
    it('should output pre/post logs as strings with Plain value returned', () => {
        expect.assertions(2);

        const instance = new TestClass();
        instance.testStrings();

        expect(Logger.log).toHaveBeenCalledWith(preLogText, `${TestClass.name}::testStrings`);
        expect(Logger.debug).toHaveBeenCalledWith(postLogText, `${TestClass.name}::testStrings`);
    });

    it('should output pre/post logs with functions', () => {
        expect.assertions(2);

        const instance = new TestClass();
        instance.testFunctions(2);

        expect(Logger.log).toHaveBeenCalledWith(`${preLogText}-2`, `${TestClass.name}::testFunctions`);
        expect(Logger.debug).toHaveBeenCalledWith(`3-${postLogText}-2`, `${TestClass.name}::testFunctions`);
    });

    it('should output error log string', () => {
        expect.assertions(2);

        const instance = new TestClass();

        expect(() => instance.testErrorString(2)).toThrow(errorLogText);
        expect(Logger.error).toHaveBeenCalledWith(errorLogText, `${TestClass.name}::testErrorString`);
    });

    it('should output error log with functions', () => {
        expect.assertions(2);

        const instance = new TestClass();

        expect(() => instance.testErrorFunction(2)).toThrow(errorLogText);
        expect(Logger.error).toHaveBeenCalledWith(
            `Error: ${errorLogText}-${errorLogText}-2`,
            `${TestClass.name}::testErrorFunction`
        );
    });

    it('should NOT output error log if arg is not passed', () => {
        expect.assertions(1);

        const instance = new TestClass();

        expect(() => instance.testNoErrorArg(2)).toThrow(errorLogText);
    });

    it('should NOT output post log with no post log arg', () => {
        expect.assertions(1);

        jest.resetAllMocks();

        const instance = new TestClass();
        instance.testNoPostLogArg();

        expect(Logger.debug).not.toHaveBeenCalled();
    });

    it('should support generic methods', () => {
        expect.assertions(2);

        const instance = new TestClass();
        const result = instance.testGeneric('test');

        expect(result).toBe('test');
        expect(Logger.log).toHaveBeenCalledWith(`${preLogText}-test`, `${TestClass.name}::testGeneric`);
    });

    describe('Promise', () => {
        it('should output pre log as strings', async () => {
            expect.assertions(1);

            const instance = new TestClass();
            await instance.testPromiseNoPostLog();

            expect(Logger.log).toHaveBeenCalledWith(preLogText, `${TestClass.name}::testPromiseNoPostLog`);
        });

        it('should output pre/post logs as strings', async () => {
            expect.assertions(1);

            const instance = new TestClass();
            await instance.testPromiseStrings();

            expect(Logger.debug).toHaveBeenCalledWith(postLogText, `${TestClass.name}::testPromiseStrings`);
        });

        it('should output error log string', async () => {
            expect.assertions(2);

            const instance = new TestClass();

            // eslint-disable-next-line jest/unbound-method
            await expect(instance.testPromiseError).rejects.toThrow(errorLogText);
            expect(Logger.error).toHaveBeenCalledWith(errorLogText, `${TestClass.name}::testPromiseError`);
        });

        it('should output error log function with argument', async () => {
            expect.assertions(2);

            const instance = new TestClass();

            await expect(() => instance.testPromiseErrorFunction(1)).rejects.toThrow(errorLogText);
            expect(Logger.error).toHaveBeenCalledWith(
                `Error: ${errorLogText}-1`,
                `${TestClass.name}::testPromiseErrorFunction`
            );
        });

        it('should support generic methods with Promise', async () => {
            expect.assertions(2);

            const instance = new TestClass();
            const result = await instance.testGenericPromise('test');

            expect(result).toBe('test');
            expect(Logger.log).toHaveBeenCalledWith(`${preLogText}-test`, `${TestClass.name}::testGenericPromise`);
        });
    });

    describe('Observable', () => {
        it('should output pre log as strings', () => {
            expect.assertions(1);

            const instance = new TestClass();
            instance.testObservableNoPostLog(1);

            expect(Logger.log).toHaveBeenCalledWith(preLogText, `${TestClass.name}::testObservableNoPostLog`);
        });

        it('should output pre/post logs as strings', () => {
            expect.assertions(2);

            const instance = new TestClass();
            instance.testObservableStrings(1).subscribe();

            expect(Logger.log).toHaveBeenCalledWith(preLogText, `${TestClass.name}::testObservableStrings`);
            expect(Logger.debug).toHaveBeenCalledWith(`2-${postLogText}-1`, `${TestClass.name}::testObservableStrings`);
        });

        it('should output error log', () => {
            expect.assertions(2);

            jest.resetAllMocks();

            const instance = new TestClass();
            instance.testObservableError().subscribe({
                next: () => void 0,
                error: () => void 0,
            });

            expect(Logger.log).toHaveBeenCalledWith(preLogText, `${TestClass.name}::testObservableError`);
            expect(Logger.error).toHaveBeenCalledWith(errorLogText, `${TestClass.name}::testObservableError`);
        });

        it('should output error log function with argument', () => {
            expect.assertions(2);

            jest.resetAllMocks();

            const instance = new TestClass();
            instance.testObservableErrorArg(2).subscribe({
                next: () => void 0,
                error: () => void 0,
            });

            expect(Logger.log).toHaveBeenCalledWith(preLogText, `${TestClass.name}::testObservableErrorArg`);
            expect(Logger.error).toHaveBeenCalledWith(`${errorLogText}-2`, `${TestClass.name}::testObservableErrorArg`);
        });

        it('should support generic methods', () => {
            expect.assertions(2);

            const instance = new TestClass();
            const result = instance.testGenericObservable('test');

            expect(result).toBeInstanceOf(Observable);
            expect(Logger.log).toHaveBeenCalledWith(`${preLogText}-test`, `${TestClass.name}::testGenericObservable`);
        });
    });
});
