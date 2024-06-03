/* eslint-disable @typescript-eslint/unbound-method,class-methods-use-this,@typescript-eslint/class-methods-use-this */
import { describe, expect, it, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { Observable, of } from 'rxjs';

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

    @Log(preLogText, (result, arg) => `${result}-${postLogText}-${arg}`)
    testObservableStrings(arg: number): Observable<number> {
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
}

jest.mock('@nestjs/common', () => ({
    Logger: {
        log: jest.fn(),
        debug: jest.fn(),
        error: jest.fn(),
    },
}));

describe('LogDecorator', () => {
    it('should output pre/post logs as strings with Plain value returned', () => {
        expect.assertions(2);

        const instance = new TestClass();
        instance.testStrings();

        expect(Logger.log).toHaveBeenCalledWith(preLogText, `${TestClass.name}::testStrings`);
        expect(Logger.debug).toHaveBeenCalledWith(`${postLogText}`, `${TestClass.name}::testStrings`);
    });

    it('should output pre/post logs as strings with Promise returned', async () => {
        expect.assertions(1);

        const instance = new TestClass();
        await instance.testPromiseStrings();

        expect(Logger.debug).toHaveBeenCalledWith(postLogText, `${TestClass.name}::testPromiseStrings`);
    });

    it('should output pre/post logs as strings with Observable returned', () => {
        expect.assertions(1);

        const instance = new TestClass();
        instance.testObservableStrings(1);

        expect(Logger.debug).toHaveBeenCalledWith(`2-${postLogText}-1`, `${TestClass.name}::testObservableStrings`);
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
});
