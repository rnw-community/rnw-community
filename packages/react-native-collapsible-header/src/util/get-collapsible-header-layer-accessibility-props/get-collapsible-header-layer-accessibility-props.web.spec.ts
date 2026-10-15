import { describe, expect, it } from '@jest/globals';

import { getCollapsibleHeaderLayerAccessibilityProps } from './get-collapsible-header-layer-accessibility-props.web';

describe('getCollapsibleHeaderLayerAccessibilityProps on web', () => {
    it.each([
        { name: 'exposed', isExposed: true, ariaHidden: false },
        { name: 'inert', isExposed: false, ariaHidden: true },
    ])('maps the $name layer to aria-hidden=$ariaHidden', ({ isExposed, ariaHidden }) => {
        expect.hasAssertions();

        expect(getCollapsibleHeaderLayerAccessibilityProps(isExposed)).toStrictEqual({ 'aria-hidden': ariaHidden });
    });
});
