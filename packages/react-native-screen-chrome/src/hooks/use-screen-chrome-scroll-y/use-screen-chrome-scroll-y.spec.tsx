import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { makeMutable } from 'react-native-reanimated';

import { useCollapsibleHeaderScroll } from '@rnw-community/react-native-collapsible-header';

import { ScreenChromeProvider } from '../../screen-chrome-provider/screen-chrome-provider';

import { useScreenChromeScrollY } from './use-screen-chrome-scroll-y.hook';

import type { ReactNode } from 'react';
import type { SharedValue } from 'react-native-reanimated';

const EXTERNAL_SCROLL_OFFSET = 120;

const renderScrollSources = (scrollY?: SharedValue<number>) =>
    renderHook(() => ({ chromeScrollY: useScreenChromeScrollY(), providerScrollY: useCollapsibleHeaderScroll().scrollY }), {
        wrapper: ({ children }: { readonly children: ReactNode }) => (
            <ScreenChromeProvider scrollY={scrollY}>{children}</ScreenChromeProvider>
        ),
    });

describe('useScreenChromeScrollY', () => {
    it('falls back to the provider-owned scroll offset without an external one', () => {
        expect.hasAssertions();

        const { result } = renderScrollSources();

        expect(result.current.chromeScrollY).toBe(result.current.providerScrollY);
    });

    it('prefers the external scroll offset passed to the provider', () => {
        expect.hasAssertions();

        const externalScrollY = makeMutable(EXTERNAL_SCROLL_OFFSET);
        const { result } = renderScrollSources(externalScrollY);

        expect(result.current.chromeScrollY).toBe(externalScrollY);
        expect(result.current.chromeScrollY).not.toBe(result.current.providerScrollY);
        expect(result.current.chromeScrollY.get()).toBe(EXTERNAL_SCROLL_OFFSET);
    });

    it('fails fast outside a screen chrome provider', () => {
        expect.hasAssertions();

        expect(() => renderHook(() => useScreenChromeScrollY())).toThrow(
            'useScreenChrome must be used within ScreenChromeProvider'
        );
    });
});
