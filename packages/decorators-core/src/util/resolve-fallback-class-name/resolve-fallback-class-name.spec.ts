import { describe, expect, it } from '@jest/globals';

import { resolveFallbackClassName } from './resolve-fallback-class-name';

describe('resolveFallbackClassName', () => {
    it("returns a named function target's own name", () => {
        expect.hasAssertions();
        const MyClass = function MyClass(): void {
            void 0;
        };
        expect(resolveFallbackClassName(MyClass)).toBe('MyClass');
    });

    it('falls back to the constructor name for an object target', () => {
        expect.hasAssertions();
        // eslint-disable-next-line @typescript-eslint/no-extraneous-class -- shape-only target for the test
        class Thing {}
        expect(resolveFallbackClassName(Thing.prototype)).toBe('Thing');
    });

    it('returns "Object" when neither own name nor constructor name is available', () => {
        expect.hasAssertions();
        const empty = Object.create(null) as object;
        expect(resolveFallbackClassName(empty)).toBe('Object');
    });

    it('skips an empty function name and falls through to constructor name', () => {
        expect.hasAssertions();
        const anon = Object.defineProperty(() => { void 0; }, 'name', { value: '' });
        expect(resolveFallbackClassName(anon)).toBe('Function');
    });
});
