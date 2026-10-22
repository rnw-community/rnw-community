import React from 'react';

import { isDefined } from '@rnw-community/shared';

import { useScreenChrome } from '../hooks/use-screen-chrome/use-screen-chrome.hook';

import { edgeFadeNativeModules } from './edge-fade-native-modules';
import { EdgeFadeProgressiveBlur } from './edge-fade-progressive-blur';
import { EdgeFadeSlicedBlur } from './edge-fade-sliced-blur';
import { getEdgeFadeBlurRadius } from './util/get-edge-fade-blur-radius/get-edge-fade-blur-radius.util';

import type { EdgeFadePropsInterface } from './edge-fade-props.interface';
import type { BlurTint } from 'expo-blur';
import type { ReactNode } from 'react';

const { ProgressiveBlurView } = edgeFadeNativeModules;

interface Props extends Pick<
    EdgeFadePropsInterface,
    'position' | 'intensity' | 'scrollAnimation' | 'blurMethod' | 'blurTarget'
> {
    readonly tint: BlurTint;
    readonly plateau: number;
}

export const EdgeFadeBlur = ({ plateau, ...props }: Props): ReactNode => {
    const { config, colorScheme } = useScreenChrome();

    if (!isDefined(ProgressiveBlurView)) {
        return <EdgeFadeSlicedBlur {...props} />;
    }

    return (
        <EdgeFadeProgressiveBlur
            ProgressiveBlur={ProgressiveBlurView}
            position={props.position}
            colorScheme={colorScheme}
            radius={getEdgeFadeBlurRadius(props.intensity, props.scrollAnimation, config)}
            plateau={plateau}
            scrollAnimation={props.scrollAnimation}
        />
    );
};
