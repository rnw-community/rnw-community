import { describe, expect, it } from '@jest/globals';
import { act, render } from '@testing-library/react-native';
import React, { useContext } from 'react';
import { Text } from 'react-native';

import { BottomChromeHeightSetterContext } from '../context/bottom-chrome-height-setter.context';
import { BottomChromeHeightContext } from '../context/bottom-chrome-height.context';

import { BottomChromeInsetProvider } from './bottom-chrome-inset-provider';

import type { OnEventFn } from '@rnw-community/shared';
import type { ReactNode } from 'react';

const PUBLISHED_HEIGHT = 88;

describe('BottomChromeInsetProvider', () => {
    it('starts at zero and broadcasts every published bottom chrome height', () => {
        expect.hasAssertions();

        let publishHeight: OnEventFn<number> | undefined;
        const Probe = (): ReactNode => {
            publishHeight = useContext(BottomChromeHeightSetterContext);

            return <Text testID="height">{useContext(BottomChromeHeightContext)}</Text>;
        };
        const screen = render(
            <BottomChromeInsetProvider>
                <Probe />
            </BottomChromeInsetProvider>
        );

        expect(screen.getByTestId('height')).toHaveTextContent('0');

        act(() => publishHeight?.(PUBLISHED_HEIGHT));

        expect(screen.getByTestId('height')).toHaveTextContent(`${PUBLISHED_HEIGHT}`);
    });
});
