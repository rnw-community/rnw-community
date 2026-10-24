import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PLAYGROUND_GEOMETRY } from '../constant/playground-geometry';

import type { ComponentProps } from 'react';

const CARD_COLORS = ['#FF3B30', '#34C759', '#007AFF', '#FFCC00', '#AF52DE', '#FF9500', '#5AC8FA', '#FF2D55'];
const ROWS = Array.from({ length: 36 }, (_, index) => index);
const STRIPES = Array.from({ length: 24 }, (_, index) => index);

const styles = StyleSheet.create({
    content: { paddingRight: PLAYGROUND_GEOMETRY.patternMargin, paddingLeft: 8 },
    row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    card: { flex: 1, height: 84, borderRadius: 14, padding: 10, overflow: 'hidden' },
    title: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
    amount: { color: '#000000', fontSize: 15, fontWeight: '700' },
    stripes: { flexDirection: 'row', marginTop: 6 },
    stripe: { width: 3, height: 14, marginRight: 3 },
});

interface Props {
    readonly scrollRef: ComponentProps<typeof ScrollView>['ref'];
    readonly stripeColor: string;
}

export const PlaygroundContent = ({ scrollRef, stripeColor }: Props) => (
    <ScrollView
        ref={scrollRef}
        style={StyleSheet.absoluteFill}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="playground-scroll"
    >
        {ROWS.map(row => (
            <View key={row} style={styles.row}>
                {[0, 1].map(column => (
                    <View
                        key={column}
                        style={[styles.card, { backgroundColor: CARD_COLORS[(row * 3 + column * 5) % CARD_COLORS.length] }]}
                    >
                        <Text style={styles.title}>{`Groceries ${String(row * 2 + column)}`}</Text>
                        <Text style={styles.amount}>{`-${String(12 + row)}.${String(10 + column * 45)} EUR`}</Text>
                        <View style={styles.stripes}>
                            {STRIPES.map(stripe => (
                                <View key={stripe} style={[styles.stripe, { backgroundColor: stripeColor }]} />
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        ))}
    </ScrollView>
);
