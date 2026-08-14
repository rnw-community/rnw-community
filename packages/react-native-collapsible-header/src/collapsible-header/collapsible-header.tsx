import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { cs, getDefined, isDefined } from '@rnw-community/shared';

import { assertValidCollapsibleHeaderConfig } from '../assert/assert-valid-collapsible-header-config.assert';
import { resolveCollapsibleHeaderMotionConfig } from '../config/resolve-collapsible-header-motion.config';
import { CollapsibleHeaderProgressContext } from '../context/collapsible-header-progress.context';
import { CollapsibleHeaderScrollContext } from '../context/collapsible-header-scroll.context';
import { useCollapsibleHeaderAnimatedLayers } from '../hooks/use-collapsible-header-animated-layers/use-collapsible-header-animated-layers.hook';
import { useCollapsibleHeaderSnapRegistration } from '../hooks/use-collapsible-header-snap-registration.hook';

import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface';

interface CollapsibleHeaderLayerTestIDs {
    readonly background?: string;
    readonly collapsed?: string;
    readonly expanded?: string;
    readonly header?: string;
    readonly persistent?: string;
}

const getLayerTestIDs = (testID?: string): CollapsibleHeaderLayerTestIDs =>
    isDefined(testID)
        ? {
              background: `${testID}-background`,
              collapsed: `${testID}-collapsed`,
              expanded: `${testID}-expanded`,
              header: `${testID}-header`,
              persistent: `${testID}-persistent`,
          }
        : {};

const styles = StyleSheet.create({
    background: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
    header: { position: 'relative' },
    content: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
    overlayContainer: { position: 'absolute', top: 0, right: 0, left: 0 },
});

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
        mode = 'flow',
        snap = false,
        stretchOnOverscroll = false,
        motion,
        headerStyle,
        backgroundStyle,
        expandedContentContainerStyle,
        collapsedContentContainerStyle,
        persistentContentContainerStyle,
        style,
        ...viewProps
    } = props;
    const resolvedCollapseDistance = collapseDistance ?? expandedHeight - collapsedHeight;
    const layerTestIDs = getLayerTestIDs(viewProps.testID);
    const scrollContext = useContext(CollapsibleHeaderScrollContext);
    const scrollSource = getDefined(scrollY ?? scrollContext?.scrollY, () => {
        throw new Error('CollapsibleHeader requires a scrollY prop or a CollapsibleHeaderProvider ancestor');
    });
    const snapContext = snap
        ? getDefined(scrollContext, () => {
              throw new Error('CollapsibleHeader snap requires a CollapsibleHeaderProvider ancestor');
          })
        : scrollContext;
    const motionConfig = resolveCollapsibleHeaderMotionConfig(motion);

    assertValidCollapsibleHeaderConfig(
        { expandedHeight, collapsedHeight, collapseDistance: resolvedCollapseDistance, collapseStart },
        motionConfig
    );
    useCollapsibleHeaderSnapRegistration(snapContext, snap, collapseStart, collapseStart + resolvedCollapseDistance);
    const { progress, ...layers } = useCollapsibleHeaderAnimatedLayers({
        scrollY: scrollSource,
        expandedHeight,
        collapsedHeight,
        collapseStart,
        collapseDistance: resolvedCollapseDistance,
        motionConfig,
        stretchOnOverscroll,
    });

    return (
        <CollapsibleHeaderProgressContext.Provider value={progress}>
            <View {...viewProps} style={[cs(mode === 'overlay', styles.overlayContainer), style]}>
                <Animated.View
                    pointerEvents="none"
                    style={[styles.background, backgroundStyle, layers.backgroundAnimatedStyle]}
                    testID={layerTestIDs.background}
                />
                <Animated.View style={[styles.header, headerStyle, layers.headerAnimatedStyle]} testID={layerTestIDs.header}>
                    <Animated.View
                        animatedProps={layers.collapsedAnimatedProps}
                        style={[styles.content, collapsedContentContainerStyle, layers.collapsedAnimatedStyle]}
                        testID={layerTestIDs.collapsed}
                    >
                        {collapsedContent}
                    </Animated.View>
                    <Animated.View
                        animatedProps={layers.expandedAnimatedProps}
                        style={[styles.content, expandedContentContainerStyle, layers.expandedAnimatedStyle]}
                        testID={layerTestIDs.expanded}
                    >
                        {expandedContent}
                    </Animated.View>
                    {isDefined(persistentContent) && (
                        <View
                            pointerEvents="box-none"
                            style={[styles.content, persistentContentContainerStyle]}
                            testID={layerTestIDs.persistent}
                        >
                            {persistentContent}
                        </View>
                    )}
                </Animated.View>
            </View>
        </CollapsibleHeaderProgressContext.Provider>
    );
};
