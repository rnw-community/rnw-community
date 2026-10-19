import { describe, expect, it } from '@jest/globals';
import { makeMutable } from 'react-native-reanimated';

import { assertScreenChromeScrollSource } from './assert-screen-chrome-scroll-source.assert';

describe('assertScreenChromeScrollSource', () => {
    it('rejects snapping combined with an external scroll offset', () => {
        expect.hasAssertions();

        expect(() => void assertScreenChromeScrollSource(true, makeMutable(0))).toThrow(
            new Error(
                'ScreenChromeProvider snapToCollapse scrolls the provider-owned scrollable, so it cannot combine with an external scrollY'
            )
        );
    });

    it.each([
        ['snapping with the provider-owned scroll', true, false],
        ['an external scroll offset without snapping', false, true],
        ['neither', false, false],
    ])('accepts %s', (_name, snapToCollapse, hasExternalScrollY) => {
        expect.hasAssertions();

        const externalScrollY = hasExternalScrollY ? makeMutable(0) : void 0;

        expect(() => void assertScreenChromeScrollSource(snapToCollapse, externalScrollY)).not.toThrow();
    });
});
