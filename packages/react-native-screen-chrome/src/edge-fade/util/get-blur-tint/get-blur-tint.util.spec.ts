import { describe, expect, it } from '@jest/globals';

import { getBlurTint } from './get-blur-tint.util';

describe('getBlurTint', () => {
    it('selects the dark tint regardless of platform', () => {
        expect.hasAssertions();

        expect(getBlurTint('dark', true)).toBe('systemThinMaterialDark');
    });

    it('selects the iOS light tint', () => {
        expect.hasAssertions();

        expect(getBlurTint('light', true)).toBe('systemChromeMaterialLight');
    });

    it('selects the non-iOS light tint', () => {
        expect.hasAssertions();

        expect(getBlurTint('light', false)).toBe('systemMaterialLight');
    });
});
