import { describe, expect, it } from '@jest/globals';

import { resolveScreenChromeColorScheme } from './resolve-screen-chrome-color-scheme.util';

import type { ScreenChromeColorSchemePreference } from '../../type/screen-chrome-color-scheme-preference.type';
import type { ScreenChromeColorScheme } from '../../type/screen-chrome-color-scheme.type';
import type { ColorSchemeName } from 'react-native';

describe('resolveScreenChromeColorScheme', () => {
    it.each<[ScreenChromeColorSchemePreference, ColorSchemeName | null | undefined, ScreenChromeColorScheme]>([
        ['light', 'dark', 'light'],
        ['dark', 'light', 'dark'],
        ['system', 'dark', 'dark'],
        ['system', 'light', 'light'],
        ['system', 'unspecified', 'light'],
        ['system', null, 'light'],
        ['system', void 0, 'light'],
    ])('resolves preference %s with system scheme %s to %s', (preference, systemColorScheme, expected) => {
        expect.hasAssertions();

        expect(resolveScreenChromeColorScheme(preference, systemColorScheme)).toBe(expected);
    });
});
