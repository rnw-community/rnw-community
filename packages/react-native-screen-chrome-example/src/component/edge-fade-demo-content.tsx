import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import type { ComponentProps } from 'react';

const STRIPE_WIDTH = 3;
const RULER_WIDTH = 6;
const TEMPORAL_WITNESS_CONTENT_OFFSET = 430;
const STRIPES = Array.from({ length: 80 }, (_, index) => index);
const TEXT_ROWS = Array.from({ length: 40 }, (_, index) => index);

const styles = StyleSheet.create({
    content: { position: 'relative' },
    pattern: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: RULER_WIDTH * 2,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    stripe: { width: STRIPE_WIDTH, marginRight: STRIPE_WIDTH },
    text: { position: 'absolute', top: 0, bottom: 0, left: 0, right: RULER_WIDTH * 2, overflow: 'hidden' },
    textRow: { fontSize: 13, lineHeight: 24, fontWeight: '700' },
    temporalWitness: { position: 'absolute', left: 18, width: 18, height: 18, backgroundColor: '#00FF00', zIndex: 5 },
});

interface Props {
    readonly base: string;
    readonly stripeColor: string;
    readonly height: number;
    readonly scrollRef: ComponentProps<typeof Animated.ScrollView>['ref'];
    readonly onScroll: ComponentProps<typeof Animated.ScrollView>['onScroll'];
    readonly temporalPrepared: boolean;
    readonly temporalDone: boolean;
}

export const EdgeFadeDemoContent = ({
    base,
    stripeColor,
    height,
    scrollRef,
    onScroll,
    temporalPrepared,
    temporalDone,
}: Props) => (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: base }]}>
        <Animated.ScrollView
            ref={scrollRef}
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            style={StyleSheet.absoluteFill}
            contentContainerStyle={{ height }}
        >
            <View style={[styles.content, { height }]} testID="edge-fade-harness">
                <View style={styles.pattern}>
                    {STRIPES.map(stripe => (
                        <View key={stripe} style={[styles.stripe, { backgroundColor: stripeColor }]} />
                    ))}
                </View>
                {temporalPrepared ? (
                    <View
                        style={[styles.temporalWitness, { top: TEMPORAL_WITNESS_CONTENT_OFFSET }]}
                        testID={temporalDone ? 'edge-fade-harness-temporal-done' : 'edge-fade-harness-temporal-witness'}
                    />
                ) : null}
            </View>
        </Animated.ScrollView>
        <View style={styles.text}>
            {TEXT_ROWS.map(row => (
                <Text key={row} numberOfLines={1} style={[styles.textRow, { color: base }]}>
                    Hamburgefonstiv 0123456789 Hamburgefonstiv
                </Text>
            ))}
        </View>
    </View>
);
