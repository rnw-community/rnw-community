import { describe, expect, it } from '@jest/globals';

import { getCollapsibleHeaderContentInsetStyle } from './get-collapsible-header-content-inset-style';

const EXPANDED_HEIGHT = 156;

describe('getCollapsibleHeaderContentInsetStyle', () => {
    it('reserves the expanded header height as top padding', () => {
        expect.hasAssertions();

        expect(getCollapsibleHeaderContentInsetStyle(EXPANDED_HEIGHT)).toStrictEqual({ paddingTop: EXPANDED_HEIGHT });
    });
});
