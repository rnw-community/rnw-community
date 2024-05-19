import { Observable, of } from 'rxjs';

import { Log } from './log.decorator';

describe('LogDecorator', () => {
    it('should output pre/post logs as strings with Plain value returned', () => {
        const instance = new TestClass();

        instance.testStrings();
    });

    it('should output pre/post logs as strings with Promise returned', async () => {
        const instance = new TestClass();

        await instance.testPromiseStrings();
    });

    it('should output pre/post logs as strings with Observable returned', async () => {
        const instance = new TestClass();

        instance.testObservableStrings();
    });

    it('should output pre/post logs with functions', () => {
        const instance = new TestClass();

        instance.testFunctions(2);
    });

    it('should output error log string', () => {
        const instance = new TestClass();

        expect(() => instance.testErrorString(2)).toThrow();
    });

    it('should output error log with functions', () => {
        const instance = new TestClass();

        expect(() => instance.testErrorFunction(2)).toThrow();
    });
});

class TestClass {
    private readonly field = 1;

    @Log('testPreLog', 'testPostLog', 'testErrorLog')
    testStrings(): number {
        return this.field;
    }

    @Log('testPreLog', 'testPostLog', 'testErrorLog')
    testPromiseStrings(): Promise<number> {
        return Promise.resolve(this.field);
    }

    @Log('testPreLog', 'testPostLog', 'testErrorLog')
    testObservableStrings(): Observable<number> {
        return of(this.field);
    }

    @Log(arg => `testPreLogFunction-${arg}`, (result, arg) => `${result}-testPreLogFunction-${arg}`)
    testFunctions(arg: number): number {
        return arg + this.field;
    }

    @Log(arg => `testPreLogFunction-${arg}`, (result, arg) => `${result}-testPreLogFunction-${arg}`, `testErrorLogFunction`)
    testErrorString(arg: number): number {
        throw new Error(`error ${arg}`);
    }

    @Log(
        arg => `testPreLogFunction-${arg}`,
        (result, arg) => `${result}-testPreLogFunction-${arg}`,
        arg => `testErrorLogFunction-${arg}`
    )
    testErrorFunction(arg: number): number {
        throw new Error(`error ${arg}`);
    }
}
