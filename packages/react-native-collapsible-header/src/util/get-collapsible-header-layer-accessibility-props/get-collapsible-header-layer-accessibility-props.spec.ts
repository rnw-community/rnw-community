import { describe, expect, it } from '@jest/globals';

import { getCollapsibleHeaderLayerAccessibilityProps } from './get-collapsible-header-layer-accessibility-props';

describe('getCollapsibleHeaderLayerAccessibilityProps', () => {
    it('keeps the exposed layer in the iOS and Android accessibility trees', () => {
        expect.hasAssertions();

        expect(getCollapsibleHeaderLayerAccessibilityProps(true)).toStrictEqual({
            accessibilityElementsHidden: false,
            importantForAccessibility: 'auto',
        });
    });

    it('removes the inert layer and its descendants from the iOS and Android accessibility trees', () => {
        expect.hasAssertions();

        expect(getCollapsibleHeaderLayerAccessibilityProps(false)).toStrictEqual({
            accessibilityElementsHidden: true,
            importantForAccessibility: 'no-hide-descendants',
        });
    });
});
