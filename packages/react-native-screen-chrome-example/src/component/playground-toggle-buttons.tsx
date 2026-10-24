import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PlaygroundTogglesInterface } from '../interface/playground-toggles.interface';

const styles = StyleSheet.create({
    row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
    button: { backgroundColor: '#1B4D3E', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
    label: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});

type BooleanKey = Exclude<keyof PlaygroundTogglesInterface, 'scheme'>;

const BOOLEAN_TOGGLES: ReadonlyArray<{ readonly key: BooleanKey; readonly name: string; readonly testID: string }> = [
    { key: 'isWashOn', name: 'Wash', testID: 'playground-toggle-wash' },
    { key: 'isBlurOn', name: 'Blur', testID: 'playground-toggle-blur' },
    { key: 'isChromeOn', name: 'Chrome', testID: 'playground-toggle-chrome' },
    { key: 'isScrolled', name: 'Scrolled', testID: 'playground-toggle-scroll' },
    { key: 'isPanelOpen', name: 'Sliders', testID: 'playground-toggle-panel' },
];

interface Props {
    readonly toggles: PlaygroundTogglesInterface;
    readonly onChange: (toggles: PlaygroundTogglesInterface) => void;
    readonly onPreset: () => void;
}

export const PlaygroundToggleButtons = ({ toggles, onChange, onPreset }: Props) => (
    <View style={styles.row}>
        <Pressable
            style={styles.button}
            testID="playground-toggle-scheme"
            onPress={() => void onChange({ ...toggles, scheme: toggles.scheme === 'dark' ? 'light' : 'dark' })}
        >
            <Text style={styles.label}>{toggles.scheme}</Text>
        </Pressable>
        {BOOLEAN_TOGGLES.map(({ key, name, testID }) => (
            <Pressable
                key={key}
                style={styles.button}
                testID={testID}
                onPress={() => void onChange({ ...toggles, [key]: !toggles[key] })}
            >
                <Text style={styles.label}>{`${name} ${toggles[key] ? 'on' : 'off'}`}</Text>
            </Pressable>
        ))}
        <Pressable style={styles.button} testID="playground-preset-budgie" onPress={onPreset}>
            <Text style={styles.label}>Budgie</Text>
        </Pressable>
    </View>
);
