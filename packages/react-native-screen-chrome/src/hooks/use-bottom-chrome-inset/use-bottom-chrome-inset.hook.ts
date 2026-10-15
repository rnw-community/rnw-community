import { useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomChromeHeightContext } from '../../context/bottom-chrome-height.context';

import type { BottomChromeInsetInterface } from '../../interface/bottom-chrome-inset.interface';

/**
 * Returns the measured bottom chrome height and full bottom footprint so scroll content clears a `ScreenChromeFooter`.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#usebottomchromeinset
 */
export const useBottomChromeInset = (): BottomChromeInsetInterface => {
    const chromeHeight = useContext(BottomChromeHeightContext);
    const insets = useSafeAreaInsets();

    return { chromeHeight, inset: chromeHeight + insets.bottom };
};
