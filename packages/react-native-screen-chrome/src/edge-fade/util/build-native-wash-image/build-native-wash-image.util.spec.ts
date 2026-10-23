import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Platform } from 'react-native';

import { buildNativeWashImage } from './build-native-wash-image.util';

const WASH_IMAGE = 'linear-gradient(to bottom, rgba(255,0,0,1) 0%, rgba(128,0,128,0.502) 50%, rgba(0,0,255,0) 100%)';

afterEach(() => {
    jest.restoreAllMocks();
});

describe('buildNativeWashImage', () => {
    it.each(['ios', 'android'] as const)(
        'blends the wash colors along the band and takes each stop alpha from the mask alone on %s',
        platform => {
            expect.hasAssertions();

            jest.replaceProperty(Platform, 'OS', platform);

            expect(
                buildNativeWashImage(
                    ['#ff0000', 'rgba(0,0,255,0.5)'],
                    ['#000000', 'rgba(0,0,0,0.5)', 'transparent'],
                    [0, 0.5, 1]
                )
            ).toBe(WASH_IMAGE);
        }
    );

    it('ignores the alpha of the configured wash colors so the outer edge is the opaque color', () => {
        expect.hasAssertions();

        expect(
            buildNativeWashImage(['rgba(255,255,255,0.42)', 'rgba(255,255,255,0.08)'], ['#000000', 'transparent'], [0, 1])
        ).toBe('linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)');
    });
});
