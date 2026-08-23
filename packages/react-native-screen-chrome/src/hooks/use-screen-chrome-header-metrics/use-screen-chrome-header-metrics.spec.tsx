import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../constant/screen-chrome-default-config.constant';
import { ScreenChromeProvider } from '../../screen-chrome-provider/screen-chrome-provider';

import { useScreenChromeHeaderMetrics } from './use-screen-chrome-header-metrics.hook';

import type { ScreenChromeHeaderMetricsInterface } from '../../interface/screen-chrome-header-metrics.interface';
import type { Metrics } from 'react-native-safe-area-context';

const INSETS: Metrics = {
    insets: { top: 59, bottom: 34, left: 0, right: 0 },
    frame: { x: 0, y: 0, width: 390, height: 844 },
};

const Probe = ({ onMetrics }: { readonly onMetrics: (metrics: ScreenChromeHeaderMetricsInterface) => null }) => {
    onMetrics(useScreenChromeHeaderMetrics());

    return <Text>probe</Text>;
};

describe('useScreenChromeHeaderMetrics', () => {
    it('derives the header footprint from the live config and device insets', () => {
        expect.hasAssertions();

        let metrics: ScreenChromeHeaderMetricsInterface | undefined;

        render(
            <SafeAreaProvider initialMetrics={INSETS}>
                <ScreenChromeProvider>
                    <Probe
                        onMetrics={value => {
                            metrics = value;

                            return null;
                        }}
                    />
                </ScreenChromeProvider>
            </SafeAreaProvider>
        );

        expect(metrics?.headerTotalHeight).toBe(INSETS.insets.top + SCREEN_CHROME_DEFAULT_CONFIG.headerHeight);
        expect(metrics?.recommendedContentTopGap).toBe(metrics?.headerTotalHeight);
    });
});
