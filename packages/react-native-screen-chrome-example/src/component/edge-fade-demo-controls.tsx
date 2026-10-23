import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const RULER_WIDTH = 6;

const styles = StyleSheet.create({
    controls: {
        position: 'absolute',
        top: '45%',
        left: 0,
        right: RULER_WIDTH * 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    control: { backgroundColor: '#1B4D3E', paddingHorizontal: 20, paddingVertical: 12, marginHorizontal: 8 },
    controlLabel: { color: '#FFFFFF', fontWeight: '700' },
});

interface Props {
    readonly backgroundLabel: string;
    readonly onScheme: () => void;
    readonly onBackground: () => void;
    readonly onState: () => void;
    readonly onPrepare: () => void;
    readonly onStart: () => void;
}

export const EdgeFadeDemoControls = ({ backgroundLabel, onScheme, onBackground, onState, onPrepare, onStart }: Props) => (
    <View style={styles.controls}>
        <Pressable onPress={onScheme} style={styles.control} testID="edge-fade-harness-scheme">
            <Text style={styles.controlLabel}>Scheme</Text>
        </Pressable>
        <Pressable
            onPress={onBackground}
            style={styles.control}
            testID="edge-fade-harness-background"
            accessibilityLabel={backgroundLabel}
        >
            <Text style={styles.controlLabel}>Background</Text>
        </Pressable>
        <Pressable onPress={onState} style={styles.control} testID="edge-fade-harness-state">
            <Text style={styles.controlLabel}>State</Text>
        </Pressable>
        <Pressable onPress={onPrepare} style={styles.control} testID="edge-fade-harness-temporal-prepare">
            <Text style={styles.controlLabel}>Prepare temporal</Text>
        </Pressable>
        <Pressable onPress={onStart} style={styles.control} testID="edge-fade-harness-temporal">
            <Text style={styles.controlLabel}>Temporal</Text>
        </Pressable>
    </View>
);
