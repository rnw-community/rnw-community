import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { isDefined, isPositiveNumber } from '@rnw-community/shared';

import type { EdgeFadePropsInterface } from '../edge-fade-props.interface';

const IGNORED_ANDROID_BLUR_WARNING =
    '[react-native-screen-chrome] EdgeFade blur intensity is ignored on Android without a blurTarget: blurMethod defaults ' +
    'to "none" there because expo-blur >=55 only blurs a BlurTargetView. Pass blurTarget to render the blur, or set ' +
    'blurMethod="none" to keep the band blur-free on Android.';

type BlurConfiguration = Pick<EdgeFadePropsInterface, 'blurMethod' | 'blurTarget' | 'intensity' | 'scrollAnimation'>;

const isDevelopmentBuild = (): boolean => typeof __DEV__ !== 'undefined' && __DEV__;

export const useIgnoredAndroidBlurWarning = ({
    blurMethod,
    blurTarget,
    intensity,
    scrollAnimation,
}: BlurConfiguration): void => {
    const hasWarned = useRef(false);
    const requestsBlur = isPositiveNumber(intensity) || isDefined(scrollAnimation?.intensityInputRange);
    const isBlurIgnored =
        Platform.OS === 'android' &&
        isDevelopmentBuild() &&
        requestsBlur &&
        !isDefined(blurMethod) &&
        !isDefined(blurTarget);

    useEffect(() => {
        if (isBlurIgnored && !hasWarned.current) {
            hasWarned.current = true;
            // eslint-disable-next-line no-console
            console.warn(IGNORED_ANDROID_BLUR_WARNING);
        }
    }, [isBlurIgnored]);
};
