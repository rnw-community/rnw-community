import React from 'react';

import { CollapsibleHeaderBackdrop, EdgeFade } from '@rnw-community/react-native-screen-chrome';

import type { EdgeFadeBandRenderPropsInterface } from '@rnw-community/react-native-screen-chrome';

interface Props {
    readonly bandHeight: number;
    readonly isBlurOnly: boolean;
    readonly isTemporal: boolean;
}

const CHROME_HEIGHT = 32;
const renderBlurOnlyBand = ({ blur }: EdgeFadeBandRenderPropsInterface) => blur;

export const EdgeFadeDemoBands = ({ bandHeight, isBlurOnly, isTemporal }: Props) => {
    const blurOnlyRenderBand = isBlurOnly ? { renderBand: renderBlurOnlyBand } : {};
    const fadeAnimation = isTemporal ? {} : { scrollAnimation: { opacityInputRange: [0, 40] as const } };
    const topBand = isTemporal ? (
        <CollapsibleHeaderBackdrop
            height={bandHeight}
            chromeHeight={CHROME_HEIGHT}
            testID="edge-fade-harness-temporal-backdrop"
            {...blurOnlyRenderBand}
        />
    ) : (
        <EdgeFade
            position="top"
            height={bandHeight}
            chromeHeight={CHROME_HEIGHT}
            scrollAnimation={{ opacityInputRange: [0, 40] }}
            {...blurOnlyRenderBand}
        />
    );

    return (
        <>
            {topBand}
            <EdgeFade
                position="bottom"
                height={bandHeight}
                chromeHeight={CHROME_HEIGHT}
                {...fadeAnimation}
                {...blurOnlyRenderBand}
            />
        </>
    );
};
