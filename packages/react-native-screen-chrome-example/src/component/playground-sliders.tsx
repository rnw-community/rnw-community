import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { PlaygroundSlider } from './playground-slider';

import type { PlaygroundConfigInterface } from '../interface/playground-config.interface';
import type { ScreenChromeColorScheme } from '@rnw-community/react-native-screen-chrome';

const styles = StyleSheet.create({
    panel: { maxHeight: 360, backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: 16, padding: 12, marginTop: 8 },
});

type NumericKey = Exclude<keyof PlaygroundConfigInterface, 'alphas'>;

const NUMERIC_SLIDERS: ReadonlyArray<{ readonly key: NumericKey; readonly maximum: number }> = [
    { key: 'topHeight', maximum: 200 },
    { key: 'bottomHeight', maximum: 200 },
    { key: 'topChrome', maximum: 100 },
    { key: 'bottomChrome', maximum: 100 },
    { key: 'intensity', maximum: 100 },
    { key: 'maxBlurIntensity', maximum: 100 },
];

interface Props {
    readonly config: PlaygroundConfigInterface;
    readonly scheme: ScreenChromeColorScheme;
    readonly onChange: (config: PlaygroundConfigInterface) => void;
}

export const PlaygroundSliders = ({ config, scheme, onChange }: Props) => {
    const setAlpha = (kind: 'solid' | 'wash', value: number) =>
        void onChange({
            ...config,
            alphas: { ...config.alphas, [scheme]: { ...config.alphas[scheme], [kind]: value } },
        });

    return (
        <ScrollView style={styles.panel} testID="playground-sliders">
            {NUMERIC_SLIDERS.map(({ key, maximum }) => (
                <PlaygroundSlider
                    key={key}
                    label={key}
                    value={config[key]}
                    maximum={maximum}
                    step={1}
                    testID={`playground-slider-${key}`}
                    onChange={value => void onChange({ ...config, [key]: value })}
                />
            ))}
            {(['solid', 'wash'] as const).map(kind => (
                <PlaygroundSlider
                    key={kind}
                    label={`${scheme} ${kind} alpha`}
                    value={config.alphas[scheme][kind]}
                    maximum={1}
                    step={0.01}
                    testID={`playground-slider-${kind}-alpha`}
                    onChange={value => void setAlpha(kind, value)}
                />
            ))}
        </ScrollView>
    );
};
