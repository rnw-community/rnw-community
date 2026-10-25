import React from 'react';

import { getDefined } from '@rnw-community/shared';

import { EdgeFade } from '../edge-fade/edge-fade';
import { useScreenChrome } from '../hooks/use-screen-chrome/use-screen-chrome.hook';

import type { CollapsibleHeaderBackdropPropsInterface } from './collapsible-header-backdrop-props.interface';
import type { ReactNode } from 'react';

/**
 * Renders a top edge fade aligned with the configured title-collapse thresholds.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#collapsibleheaderbackdrop
 */
export const CollapsibleHeaderBackdrop = ({
    height,
    intensity,
    scrollAnimation,
    ...edgeFadeProps
}: CollapsibleHeaderBackdropPropsInterface): ReactNode => {
    const { config } = useScreenChrome();

    return (
        <EdgeFade
            {...edgeFadeProps}
            position="top"
            height={getDefined(height, () => config.headerBackdropHeight)}
            intensity={getDefined(intensity, () => config.maxBlurIntensity)}
            scrollAnimation={scrollAnimation}
        />
    );
};
