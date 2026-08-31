import { describe, expect, it } from '@jest/globals';

import { addScrollContentInset } from './add-scroll-content-inset.util';

const insets = { top: 59, right: 12, bottom: 34, left: 12 };
const headerInset = 64;

describe('addScrollContentInset', () => {
    it('stacks safe-area and chrome insets on top of consumer vertical padding', () => {
        expect.hasAssertions();

        const merged = addScrollContentInset(insets, headerInset, 96, { paddingTop: 8, paddingBottom: 4 });

        expect(merged.paddingTop).toBe(59 + headerInset + 8);
        expect(merged.paddingBottom).toBe(34 + 96 + 4);
    });

    it('resolves to the computed insets alone when the consumer style carries no padding', () => {
        expect.hasAssertions();

        const merged = addScrollContentInset(insets, headerInset, 0, void 0);

        expect(merged).toStrictEqual({ paddingTop: 59 + headerInset, paddingBottom: 34 });
    });

    it('keeps non-padding consumer style keys and injects no horizontal padding', () => {
        expect.hasAssertions();

        const merged = addScrollContentInset(insets, 0, 0, [{ gap: 12 }, { paddingTop: 10 }]);

        expect(merged).toStrictEqual({ gap: 12, paddingTop: 59 + 10, paddingBottom: 34 });
        expect(merged.paddingLeft).toBeUndefined();
        expect(merged.paddingRight).toBeUndefined();
    });

    it('ignores non-numeric consumer padding instead of producing NaN', () => {
        expect.hasAssertions();

        const merged = addScrollContentInset(insets, 10, 10, { paddingTop: '5%', paddingBottom: '5%' });

        expect(merged.paddingTop).toBe(59 + 10);
        expect(merged.paddingBottom).toBe(34 + 10);
    });
});
