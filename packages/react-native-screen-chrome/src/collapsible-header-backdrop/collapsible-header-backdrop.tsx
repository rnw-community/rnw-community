import React from 'react';

import { EdgeFade } from '../edge-fade/edge-fade.js';
import { useScreenChrome } from '../hook/use-screen-chrome.hook.js';

import type { ReactNode } from 'react';

/**
 * Renders a top edge fade aligned with the configured title-collapse thresholds.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#collapsibleheaderbackdrop
 */
export const CollapsibleHeaderBackdrop = (): ReactNode => {
    const { config } = useScreenChrome();
    const scrollAnimation = {
        opacityInputRange: [config.collapseStart, config.smallTitleStart] as const,
        intensityInputRange: [config.collapseStart, config.collapseEnd] as const,
    };

    return <EdgeFade position="top" height={config.headerBackdropHeight} scrollAnimation={scrollAnimation} />;
};
