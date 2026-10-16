import type { ScreenChromeColorSchemePreference } from '../../type/screen-chrome-color-scheme-preference.type';
import type { ScreenChromeColorScheme } from '../../type/screen-chrome-color-scheme.type';
import type { ColorSchemeName } from 'react-native';

export const resolveScreenChromeColorScheme = (
    preference: ScreenChromeColorSchemePreference,
    systemColorScheme: ColorSchemeName | null | undefined
): ScreenChromeColorScheme => {
    if (preference !== 'system') {
        return preference;
    }

    return systemColorScheme === 'dark' ? 'dark' : 'light';
};
