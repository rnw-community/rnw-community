import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import Animated, { makeMutable } from 'react-native-reanimated';

import { useCollapsibleHeaderScroll } from '@rnw-community/react-native-collapsible-header';
import { emptyFn } from '@rnw-community/shared';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';
import { useScreenChrome } from '../hooks/use-screen-chrome/use-screen-chrome.hook';

import { ScreenChromeProvider } from './screen-chrome-provider';

import type { ScreenChromeContextValueInterface } from '../interface/screen-chrome-context-value.interface';
import type { ScreenChromeColorSchemePreference } from '../type/screen-chrome-color-scheme-preference.type';
import type { ScreenChromeColorScheme } from '../type/screen-chrome-color-scheme.type';
import type { CollapsibleHeaderScroll } from '@rnw-community/react-native-collapsible-header';
import type * as ReactNative from 'react-native';
import type { ColorSchemeName } from 'react-native';
import type { ScrollHandlerProcessed } from 'react-native-reanimated';

const OVERRIDDEN_HEADER_HEIGHT = 72;
const CUSTOM_MASK_STOP_POSITION = 0.25;
const INVALID_HEADER_HEIGHT = -1;
const EXTERNAL_SCROLL_OFFSET = 24;

interface ConsumerProps {
    readonly onValue: (value: ScreenChromeContextValueInterface) => void;
}

interface ScrollConsumerProps {
    readonly onScrollValue: (value: CollapsibleHeaderScroll) => void;
}

interface ProviderProps {
    readonly colorScheme?: ScreenChromeColorSchemePreference;
    readonly config?: Parameters<typeof ScreenChromeProvider>[0]['config'];
    readonly renderEdgeFadeBand?: Parameters<typeof ScreenChromeProvider>[0]['renderEdgeFadeBand'];
    readonly scrollY?: Parameters<typeof ScreenChromeProvider>[0]['scrollY'];
}

interface ScrollableListHandle {
    readonly getScrollableNode: () => null;
    readonly scrollToOffset: (offset: number) => void;
}

const HandleList = forwardRef<ScrollableListHandle, { readonly onScroll: ScrollHandlerProcessed }>(({ onScroll }, ref) => {
    useImperativeHandle(ref, () => ({ getScrollableNode: () => null, scrollToOffset: emptyFn }));

    return <Animated.ScrollView testID="scrollable" onScroll={onScroll} scrollEventThrottle={16} />;
});
HandleList.displayName = 'HandleList';

const HandleListProbe = () => {
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();

    return <HandleList ref={scrollRef} onScroll={onScroll} />;
};

const Consumer = ({ onValue }: ConsumerProps) => {
    const value = useScreenChrome();

    useEffect(() => {
        onValue(value);
    }, [onValue, value]);

    return null;
};

const ScrollConsumer = ({ onScrollValue }: ScrollConsumerProps) => {
    const value = useCollapsibleHeaderScroll();

    useEffect(() => {
        onScrollValue(value);
    }, [onScrollValue, value]);

    return null;
};

const captureContext = (props: ProviderProps = {}): ScreenChromeContextValueInterface => {
    const values: ScreenChromeContextValueInterface[] = [];

    render(
        <ScreenChromeProvider {...props}>
            <Consumer
                onValue={value => {
                    values.push(value);
                }}
            />
        </ScreenChromeProvider>
    );

    return values[0];
};

describe('ScreenChromeProvider context', () => {
    it('provides the default light scheme and native config', () => {
        expect.hasAssertions();

        const context = captureContext();

        expect(context.colorScheme).toBe('light');
        expect(context.config).toEqual(SCREEN_CHROME_DEFAULT_CONFIG);
    });

    it('provides supplied scheme and deep config overrides', () => {
        expect.hasAssertions();

        const context = captureContext({
            colorScheme: 'dark',
            config: {
                headerHeight: OVERRIDDEN_HEADER_HEIGHT,
                colors: {
                    dark: {
                        solid: 'black',
                    },
                },
                maskStops: {
                    top: {
                        [CUSTOM_MASK_STOP_POSITION]: { color: 'rgba(0,0,0,0.25)' },
                    },
                },
            },
        });

        expect(context.colorScheme).toBe('dark');
        expect(context.config.headerHeight).toBe(OVERRIDDEN_HEADER_HEIGHT);
        expect(context.config.colors.dark).toEqual({
            ...SCREEN_CHROME_DEFAULT_CONFIG.colors.dark,
            solid: 'black',
        });
        expect(context.config.maskStops.top[CUSTOM_MASK_STOP_POSITION]).toEqual({ color: 'rgba(0,0,0,0.25)' });
        expect(context.config.maskStops.bottom).toEqual(SCREEN_CHROME_DEFAULT_CONFIG.maskStops.bottom);
    });

    it('provides no edge-fade band renderer unless one is supplied', () => {
        expect.hasAssertions();

        const renderEdgeFadeBand = jest.fn(() => null);

        expect(captureContext().renderEdgeFadeBand).toBeUndefined();
        expect(captureContext({ renderEdgeFadeBand }).renderEdgeFadeBand).toBe(renderEdgeFadeBand);
    });

    it('rejects an invalid configuration before rendering children', () => {
        expect.hasAssertions();

        expect(() => captureContext({ config: { headerHeight: INVALID_HEADER_HEIGHT } })).toThrow(
            'headerHeight must be a positive finite number'
        );
    });

    it('provides collapsible-header scroll wiring to descendants', () => {
        expect.hasAssertions();

        const scrollValues: CollapsibleHeaderScroll[] = [];

        render(
            <ScreenChromeProvider>
                <ScrollConsumer
                    onScrollValue={value => {
                        scrollValues.push(value);
                    }}
                />
            </ScreenChromeProvider>
        );
        const [scroll] = scrollValues;

        expect(scroll.scrollY.get()).toBe(0);
        expect(scroll.onScroll).toBeDefined();
        expect(scroll.scrollRef).toBeDefined();
    });

    it('gives every provider its own scroll offset', () => {
        expect.hasAssertions();

        const scrollValues: CollapsibleHeaderScroll[] = [];
        const onScrollValue = (value: CollapsibleHeaderScroll): void => {
            scrollValues.push(value);
        };

        render(
            <>
                <ScreenChromeProvider>
                    <ScrollConsumer onScrollValue={onScrollValue} />
                </ScreenChromeProvider>
                <ScreenChromeProvider>
                    <ScrollConsumer onScrollValue={onScrollValue} />
                </ScreenChromeProvider>
            </>
        );

        expect(scrollValues[0]?.scrollY).not.toBe(scrollValues[scrollValues.length - 1]?.scrollY);
    });
});

const mockSystemColorScheme = (systemColorScheme: ColorSchemeName): void => {
    jest.spyOn(jest.requireActual<typeof ReactNative>('react-native'), 'useColorScheme').mockReturnValue(systemColorScheme);
};

describe('ScreenChromeProvider system color scheme', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each<[ColorSchemeName, ScreenChromeColorScheme]>([
        ['dark', 'dark'],
        ['light', 'light'],
        ['unspecified', 'light'],
    ])('resolves system appearance %s to the %s palette at render', (systemScheme, expected) => {
        expect.hasAssertions();

        mockSystemColorScheme(systemScheme);

        expect(captureContext({ colorScheme: 'system' }).colorScheme).toBe(expected);
    });

    it('keeps an explicit scheme regardless of the system appearance', () => {
        expect.hasAssertions();

        mockSystemColorScheme('dark');

        expect(captureContext({ colorScheme: 'light' }).colorScheme).toBe('light');
        expect(captureContext().colorScheme).toBe('light');
    });
});

describe('ScreenChromeProvider external scroll offset', () => {
    it('provides an external scroll offset only when one is supplied', () => {
        expect.hasAssertions();

        const scrollY = makeMutable(EXTERNAL_SCROLL_OFFSET);

        expect(captureContext().externalScrollY).toBeUndefined();
        expect(captureContext({ scrollY }).externalScrollY).toBe(scrollY);
    });

    it('rejects snapToCollapse combined with an external scroll offset', () => {
        expect.hasAssertions();

        const scrollY = makeMutable(EXTERNAL_SCROLL_OFFSET);

        expect(() => captureContext({ scrollY, config: { snapToCollapse: true } })).toThrow(
            'snapToCollapse scrolls the provider-owned scrollable, so it cannot combine with an external scrollY'
        );
        expect(captureContext({ config: { snapToCollapse: true } }).config.snapToCollapse).toBe(true);
    });
});

describe('ScreenChromeProvider native offset sync forwarding', () => {
    it('forwards syncNativeScrollOffset to the collapsible-header provider, proven by its documented constraint', () => {
        expect.hasAssertions();

        const spy = jest.spyOn(console, 'error').mockImplementation(emptyFn);

        expect(() =>
            render(
                <ScreenChromeProvider syncNativeScrollOffset>
                    <HandleListProbe />
                </ScreenChromeProvider>
            )
        ).toThrow();

        spy.mockRestore();
    });

    it('leaves imperative-handle scrollables working when the sync flag is omitted', () => {
        expect.hasAssertions();

        const screen = render(
            <ScreenChromeProvider>
                <HandleListProbe />
            </ScreenChromeProvider>
        );

        expect(screen.getByTestId('scrollable')).toBeTruthy();
    });
});
