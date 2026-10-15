import React, { useState } from 'react';

import { BottomChromeHeightSetterContext } from '../context/bottom-chrome-height-setter.context';
import { BottomChromeHeightContext } from '../context/bottom-chrome-height.context';

import type { ReactNode } from 'react';

interface Props {
    readonly children: ReactNode;
}

/**
 * Owns the measured bottom chrome height that `ScreenChromeFooter` publishes and `useBottomChromeInset` reads.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#bottomchromeinsetprovider
 */
export const BottomChromeInsetProvider = ({ children }: Props): ReactNode => {
    const [chromeHeight, setChromeHeight] = useState(0);

    return (
        <BottomChromeHeightSetterContext.Provider value={setChromeHeight}>
            <BottomChromeHeightContext.Provider value={chromeHeight}>{children}</BottomChromeHeightContext.Provider>
        </BottomChromeHeightSetterContext.Provider>
    );
};
