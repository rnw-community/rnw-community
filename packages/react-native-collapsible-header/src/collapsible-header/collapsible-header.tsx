import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { isDefined } from '@rnw-community/shared';

import { assertValidCollapsibleHeaderConfig } from '../assert/assert-valid-collapsible-header-config.assert';
import { resolveCollapsibleHeaderMotionConfig } from '../config/resolve-collapsible-header-motion.config';

import { useCollapsibleHeaderAnimatedLayers } from './use-collapsible-header-animated-layers';

import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface';

const styles = StyleSheet.create({
    background: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
    header: { position: 'relative' },
    content: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
});
const AnimatedView = Animated.createAnimatedComponent(View);

/**
 * Renders caller-owned expanded and collapsed content inside an animated header shell.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#collapsibleheader
 */
export const CollapsibleHeader = (props: CollapsibleHeaderProps) => {
    const {
        expandedContent,
        collapsedContent,
        persistentContent,
        scrollY,
        expandedHeight,
        collapsedHeight,
        collapseDistance,
        collapseStart = 0,
        motion,
        headerStyle,
        backgroundStyle,
        expandedContentContainerStyle,
        collapsedContentContainerStyle,
        persistentContentContainerStyle,
        style,
        ...viewProps
    } = props;
    const motionConfig = resolveCollapsibleHeaderMotionConfig(motion);

    assertValidCollapsibleHeaderConfig({ expandedHeight, collapsedHeight, collapseDistance, collapseStart }, motionConfig);
    const {
        expandedAnimatedStyle,
        collapsedAnimatedStyle,
        backgroundAnimatedStyle,
        headerAnimatedStyle,
        expandedAnimatedProps,
        collapsedAnimatedProps,
    } = useCollapsibleHeaderAnimatedLayers({
        scrollY,
        expandedHeight,
        collapsedHeight,
        collapseStart,
        collapseDistance,
        motionConfig,
    });

    return (
        <View {...viewProps} style={style}>
            <AnimatedView pointerEvents="none" style={[styles.background, backgroundStyle, backgroundAnimatedStyle]} />
            <AnimatedView style={[styles.header, headerStyle, headerAnimatedStyle]}>
                <AnimatedView
                    animatedProps={collapsedAnimatedProps}
                    style={[styles.content, collapsedContentContainerStyle, collapsedAnimatedStyle]}
                >
                    {collapsedContent}
                </AnimatedView>
                <AnimatedView
                    animatedProps={expandedAnimatedProps}
                    style={[styles.content, expandedContentContainerStyle, expandedAnimatedStyle]}
                >
                    {expandedContent}
                </AnimatedView>
                {isDefined(persistentContent) && (
                    <View pointerEvents="box-none" style={[styles.content, persistentContentContainerStyle]}>
                        {persistentContent}
                    </View>
                )}
            </AnimatedView>
        </View>
    );
};
