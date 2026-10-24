import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { GestureResponderEvent, LayoutChangeEvent } from 'react-native';

const styles = StyleSheet.create({
    row: { marginVertical: 3 },
    label: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    track: { height: 26, justifyContent: 'center', backgroundColor: '#2C2C2E', borderRadius: 13 },
    fill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#0A84FF', borderRadius: 13 },
});

interface Props {
    readonly label: string;
    readonly value: number;
    readonly maximum: number;
    readonly step: number;
    readonly testID: string;
    readonly onChange: (value: number) => void;
}

export const PlaygroundSlider = ({ label, value, maximum, step, testID, onChange }: Props) => {
    const [width, setWidth] = useState(1);
    const select = (event: GestureResponderEvent) => {
        const fraction = Math.min(1, Math.max(0, event.nativeEvent.locationX / width));

        onChange(Number((Math.round((fraction * maximum) / step) * step).toFixed(2)));
    };

    const nudge = (direction: number) => {
        onChange(Number(Math.min(maximum, Math.max(0, value + direction * step)).toFixed(2)));
    };

    return (
        <View style={styles.row}>
            <Text style={styles.label} testID={`${testID}-value`}>{`${label} ${String(value)}`}</Text>
            <View
                testID={testID}
                style={styles.track}
                accessible
                accessibilityRole="adjustable"
                accessibilityLabel={label}
                accessibilityValue={{ min: 0, max: maximum, now: value }}
                accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
                onAccessibilityAction={event => void nudge(event.nativeEvent.actionName === 'increment' ? 1 : -1)}
                onLayout={(event: LayoutChangeEvent) => void setWidth(event.nativeEvent.layout.width)}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={select}
                onResponderMove={select}
            >
                <View pointerEvents="none" style={[styles.fill, { width: `${(value / maximum) * 100}%` }]} />
            </View>
        </View>
    );
};
