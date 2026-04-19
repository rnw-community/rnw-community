import { describe, expect, it, jest } from '@jest/globals';

import { consoleTransport } from '../../console-transport';

describe('consoleTransport', () => {
    it('calls console.log with formatted message', () => {
        const spy = jest.spyOn(console, 'log').mockImplementation(() => void 0);
        consoleTransport.log('hello', 'MyClass::myMethod');
        expect(spy).toHaveBeenCalledWith('[MyClass::myMethod] hello');
        spy.mockRestore();
    });

    it('calls console.debug with formatted message', () => {
        const spy = jest.spyOn(console, 'debug').mockImplementation(() => void 0);
        consoleTransport.debug('done', 'MyClass::myMethod');
        expect(spy).toHaveBeenCalledWith('[MyClass::myMethod] done');
        spy.mockRestore();
    });

    it('calls console.error with message and error', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => void 0);
        const err = new Error('oops');
        consoleTransport.error('failed', err, 'MyClass::myMethod');
        expect(spy).toHaveBeenCalledWith('[MyClass::myMethod] failed', err);
        spy.mockRestore();
    });
});
