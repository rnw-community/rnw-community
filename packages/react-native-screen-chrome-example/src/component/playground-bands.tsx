import React, { Children, isValidElement } from 'react';

import { CollapsibleHeaderBackdrop, EdgeFade } from '@rnw-community/react-native-screen-chrome';

import type { PlaygroundConfigInterface } from '../interface/playground-config.interface';
import type { PlaygroundTogglesInterface } from '../interface/playground-toggles.interface';
import type { EdgeFadeBandRenderPropsInterface } from '@rnw-community/react-native-screen-chrome';
import type { ReactNode } from 'react';

const renderBlurOnly = ({ blur }: EdgeFadeBandRenderPropsInterface) => blur;
const renderWashOnly = ({ defaultBand }: EdgeFadeBandRenderPropsInterface) =>
    isValidElement<{ readonly children: ReactNode }>(defaultBand)
        ? Children.toArray(defaultBand.props.children).slice(1)
        : defaultBand;
const renderNothing = () => null;

const getRenderBandProps = ({ isWashOn, isBlurOn }: PlaygroundTogglesInterface) => {
    if (isWashOn && isBlurOn) {
        return {};
    }
    if (isBlurOn) {
        return { renderBand: renderBlurOnly };
    }

    return { renderBand: isWashOn ? renderWashOnly : renderNothing };
};

interface Props {
    readonly config: PlaygroundConfigInterface;
    readonly toggles: PlaygroundTogglesInterface;
}

export const PlaygroundBands = ({ config, toggles }: Props) => {
    const renderBandProps = getRenderBandProps(toggles);

    return toggles.isChromeOn ? (
        <>
            <CollapsibleHeaderBackdrop testID="playground-top-band" {...renderBandProps} />
            <EdgeFade
                position="bottom"
                chromeHeight={config.bottomChrome}
                testID="playground-bottom-band"
                {...renderBandProps}
            />
        </>
    ) : null;
};
