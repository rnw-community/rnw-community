import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React, { useEffect } from 'react';
import { Text } from 'react-native';

import { isDefined } from '@rnw-community/shared';

import { CollapsibleHeaderProvider } from '../../provider/collapsible-header-provider/collapsible-header-provider';

import { useCollapsibleHeaderScroll } from './use-collapsible-header-scroll.hook';

import type { CollapsibleHeaderScroll } from '../../interface/collapsible-header-scroll.interface';
import type { Maybe, OnEventFn } from '@rnw-community/shared';

const ScrollProbe = ({ onCapture }: { readonly onCapture: OnEventFn<CollapsibleHeaderScroll> }) => {
    const scroll = useCollapsibleHeaderScroll();

    useEffect(() => void onCapture(scroll), [onCapture, scroll]);

    return <Text>Probe</Text>;
};

describe('useCollapsibleHeaderScroll', () => {
    it('returns the provider scroll wiring', () => {
        expect.hasAssertions();
        const captured: { value: Maybe<CollapsibleHeaderScroll> } = { value: null };
        render(
            <CollapsibleHeaderProvider>
                <ScrollProbe
                    onCapture={scroll => {
                        captured.value = scroll;
                    }}
                />
            </CollapsibleHeaderProvider>
        );

        expect(captured.value?.scrollY.get()).toBe(0);
        expect(isDefined(captured.value?.onScroll)).toBe(true);
        expect(isDefined(captured.value?.scrollRef)).toBe(true);
    });

    it('requires a provider ancestor', () => {
        expect.hasAssertions();

        expect(() =>
            render(
                <ScrollProbe
                    onCapture={() => {
                        throw new Error('Scroll wiring must not resolve without a provider');
                    }}
                />
            )
        ).toThrow('useCollapsibleHeaderScroll requires a CollapsibleHeaderProvider ancestor');
    });
});
