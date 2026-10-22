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
    chromeHeight,
    scrollAnimation,
    ...edgeFadeProps
}: CollapsibleHeaderBackdropPropsInterface): ReactNode => {
    const { config } = useScreenChrome();
    const resolvedScrollAnimation = getDefined(scrollAnimation, () => ({
        opacityInputRange: [config.collapseStart, config.smallTitleStart] as const,
        intensityInputRange: [config.collapseStart, config.collapseEnd] as const,
    }));

    return (
        <EdgeFade
            {...edgeFadeProps}
            position="top"
            height={getDefined(height, () => config.headerBackdropHeight)}
            chromeHeight={getDefined(chromeHeight, () => config.headerHeight)}
            scrollAnimation={resolvedScrollAnimation}
        />
    );
};
