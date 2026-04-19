import { describe, expect, it } from '@jest/globals';

import { buildContext } from './build-context';

describe('buildContext', () => {
    it('uses fallbackClassName when self is null, undefined, or globalThis', () => {
        expect(buildContext(null, 'Fallback', 'm', [] as const).className).toBe('Fallback');
        expect(buildContext(undefined, 'Fallback', 'm', [] as const).className).toBe('Fallback');
        expect(buildContext(globalThis, 'Fallback', 'm', [] as const).className).toBe('Fallback');
    });

    it('uses fallbackClassName when self.constructor.name is empty', () => {
        const self = { constructor: { name: '' } };
        expect(buildContext(self, 'Fallback', 'm', [] as const).className).toBe('Fallback');
    });

    it('uses fallbackClassName when self has no constructor.name', () => {
        const self = { constructor: { name: undefined } };
        expect(buildContext(self, 'Fallback', 'm', [] as const).className).toBe('Fallback');
    });

    it('preserves args and produces logContext as ClassName::methodName', () => {
        class Svc {}
        const ctx = buildContext(new Svc(), 'Fallback', 'doStuff', [1, 'x'] as const);
        expect(ctx.className).toBe('Svc');
        expect(ctx.methodName).toBe('doStuff');
        expect(ctx.logContext).toBe('Svc::doStuff');
        expect(ctx.args).toEqual([1, 'x']);
    });

    it('uses function name when self is a named function (static method context)', () => {
        class StaticSvc {
            static doWork(): void {}
        }
        expect(buildContext(StaticSvc, 'Fallback', 'doWork', [] as const).className).toBe('StaticSvc');
    });

    it('uses fallbackClassName when self is an anonymous function', () => {
        const anon = function (): void {};
        Object.defineProperty(anon, 'name', { value: '' });
        expect(buildContext(anon, 'Fallback', 'm', [] as const).className).toBe('Fallback');
    });
});
