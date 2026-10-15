import React, { useState } from 'react';

import { BottomChromeHeightSetterContext } from '../context/bottom-chrome-height-setter.context';
import { BottomChromeHeightContext } from '../context/bottom-chrome-height.context';

import type { BottomChromeHeightRegistryInterface } from '../interface/bottom-chrome-height-registry.interface';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

interface Props {
    readonly children: ReactNode;
}

type FooterHeights = ReadonlyMap<symbol, number>;

const createRegistry = (setHeights: Dispatch<SetStateAction<FooterHeights>>): BottomChromeHeightRegistryInterface => ({
    publish: (footerId, height) => {
        setHeights(prev => (prev.get(footerId) === height ? prev : new Map(prev).set(footerId, height)));
    },
    withdraw: footerId => {
        setHeights(prev => {
            if (!prev.has(footerId)) {
                return prev;
            }

            const next = new Map(prev);
            next.delete(footerId);

            return next;
        });
    },
});

/**
 * Owns the measured bottom chrome heights that `ScreenChromeFooter`s publish and `useBottomChromeInset` reads.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#bottomchromeinsetprovider
 */
export const BottomChromeInsetProvider = ({ children }: Props): ReactNode => {
    const [heights, setHeights] = useState<FooterHeights>(() => new Map());
    const [registry] = useState(() => createRegistry(setHeights));

    return (
        <BottomChromeHeightSetterContext.Provider value={registry}>
            <BottomChromeHeightContext.Provider value={Math.max(0, ...heights.values())}>
                {children}
            </BottomChromeHeightContext.Provider>
        </BottomChromeHeightSetterContext.Provider>
    );
};
