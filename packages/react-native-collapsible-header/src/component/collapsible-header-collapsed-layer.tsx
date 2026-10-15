import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { isDefined } from '@rnw-community/shared';

import type { CollapsibleHeaderCollapsedTransition } from '../type/collapsible-header-collapsed-transition.type';
import type { ComponentProps, ReactNode } from 'react';

type AnimatedViewProps = ComponentProps<typeof Animated.View>;

interface CollapsibleHeaderCollapsedLayerProps {
    readonly transition: CollapsibleHeaderCollapsedTransition;
    readonly collapsedHeight: number;
    readonly animatedProps: AnimatedViewProps['animatedProps'];
    readonly style: AnimatedViewProps['style'];
    readonly testID?: string;
    readonly children: ReactNode;
}

const styles = StyleSheet.create({
    clip: { position: 'absolute', top: 0, right: 0, left: 0, overflow: 'hidden', pointerEvents: 'box-none' },
});

export const CollapsibleHeaderCollapsedLayer = ({
    transition,
    collapsedHeight,
    animatedProps,
    style,
    testID,
    children,
}: CollapsibleHeaderCollapsedLayerProps) => {
    const layer = (
        <Animated.View animatedProps={animatedProps} style={style} testID={testID}>
            {children}
        </Animated.View>
    );

    if (transition === 'fade') {
        return layer;
    }

    return (
        <View style={[styles.clip, { height: collapsedHeight }]} testID={isDefined(testID) ? `${testID}-clip` : testID}>
            {layer}
        </View>
    );
};
