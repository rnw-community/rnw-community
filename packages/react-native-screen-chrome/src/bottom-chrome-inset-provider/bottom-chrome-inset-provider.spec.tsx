import { describe, expect, it } from '@jest/globals';
import { act, render } from '@testing-library/react-native';
import React, { useContext } from 'react';
import { Text } from 'react-native';

import { BottomChromeHeightSetterContext } from '../context/bottom-chrome-height-setter.context';
import { BottomChromeHeightContext } from '../context/bottom-chrome-height.context';

import { BottomChromeInsetProvider } from './bottom-chrome-inset-provider';

import type { BottomChromeHeightRegistryInterface } from '../interface/bottom-chrome-height-registry.interface';
import type { ReactNode } from 'react';

const FIRST_FOOTER = Symbol('first');
const SECOND_FOOTER = Symbol('second');
const SHORT_HEIGHT = 64;
const TALL_HEIGHT = 88;

const renderProvider = () => {
    const registries: BottomChromeHeightRegistryInterface[] = [];
    let renderCount = 0;
    const Probe = (): ReactNode => {
        registries.push(useContext(BottomChromeHeightSetterContext));
        renderCount += 1;

        return <Text testID="height">{useContext(BottomChromeHeightContext)}</Text>;
    };
    const screen = render(
        <BottomChromeInsetProvider>
            <Probe />
        </BottomChromeInsetProvider>
    );
    const [registry] = registries;

    return { registries, registry, screen, getRenderCount: () => renderCount };
};

describe('BottomChromeInsetProvider', () => {
    it('starts at zero and broadcasts a published footer height through a stable registry', () => {
        expect.hasAssertions();

        const { registries, registry, screen } = renderProvider();

        expect(screen.getByTestId('height')).toHaveTextContent('0');

        act(() => void registry.publish(FIRST_FOOTER, TALL_HEIGHT));

        expect(screen.getByTestId('height')).toHaveTextContent(`${TALL_HEIGHT}`);
        expect(new Set(registries).size).toBe(1);
    });

    it('broadcasts the tallest registered footer and keeps it when a shorter one withdraws', () => {
        expect.hasAssertions();

        const { registry, screen } = renderProvider();

        act(() => {
            registry.publish(FIRST_FOOTER, SHORT_HEIGHT);
            registry.publish(SECOND_FOOTER, TALL_HEIGHT);
        });

        expect(screen.getByTestId('height')).toHaveTextContent(`${TALL_HEIGHT}`);

        act(() => void registry.withdraw(SECOND_FOOTER));

        expect(screen.getByTestId('height')).toHaveTextContent(`${SHORT_HEIGHT}`);

        act(() => void registry.withdraw(FIRST_FOOTER));

        expect(screen.getByTestId('height')).toHaveTextContent('0');
    });

    it('skips re-rendering for an unchanged height or an unknown withdrawal', () => {
        expect.hasAssertions();

        const { registry, getRenderCount } = renderProvider();

        act(() => void registry.publish(FIRST_FOOTER, SHORT_HEIGHT));

        const settledRenderCount = getRenderCount();

        act(() => {
            registry.publish(FIRST_FOOTER, SHORT_HEIGHT);
            registry.withdraw(SECOND_FOOTER);
        });

        expect(getRenderCount()).toBe(settledRenderCount);
    });
});
