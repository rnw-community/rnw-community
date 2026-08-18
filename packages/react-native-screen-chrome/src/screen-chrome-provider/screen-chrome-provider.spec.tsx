import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React, { useEffect } from 'react';

import { useCollapsibleHeaderScroll } from '@rnw-community/react-native-collapsible-header';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';
import { useScreenChrome } from '../hooks/use-screen-chrome/use-screen-chrome.hook';

import { ScreenChromeProvider } from './screen-chrome-provider';

import type { ScreenChromeContextValueInterface } from '../interface/screen-chrome-context-value.interface';
import type { ScreenChromeColorScheme } from '../type/screen-chrome-color-scheme.type';
import type { CollapsibleHeaderScroll } from '@rnw-community/react-native-collapsible-header';
import type { ReactNode } from 'react';

const OVERRIDDEN_HEADER_HEIGHT = 72;
const CUSTOM_MASK_STOP_POSITION = 0.25;
const INVALID_HEADER_HEIGHT = -1;

interface ConsumerProps {
    readonly onValue: (value: ScreenChromeContextValueInterface) => void;
}

interface ScrollConsumerProps {
    readonly onScrollValue: (value: CollapsibleHeaderScroll) => void;
}

interface SubjectProps {
    readonly children?: ReactNode;
    readonly colorScheme?: ScreenChromeColorScheme;
    readonly config?: Parameters<typeof ScreenChromeProvider>[0]['config'];
}

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

const Subject = ({ children, colorScheme, config }: SubjectProps) => (
    <ScreenChromeProvider colorScheme={colorScheme} config={config}>
        {children}
    </ScreenChromeProvider>
);

const captureContext = (props: Omit<SubjectProps, 'children'> = {}): ScreenChromeContextValueInterface => {
    const values: ScreenChromeContextValueInterface[] = [];

    render(
        <Subject {...props}>
            <Consumer
                onValue={value => {
                    values.push(value);
                }}
            />
        </Subject>
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
            <Subject>
                <ScrollConsumer
                    onScrollValue={value => {
                        scrollValues.push(value);
                    }}
                />
            </Subject>
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
                <Subject>
                    <ScrollConsumer onScrollValue={onScrollValue} />
                </Subject>
                <Subject>
                    <ScrollConsumer onScrollValue={onScrollValue} />
                </Subject>
            </>
        );

        expect(scrollValues.at(0)?.scrollY).not.toBe(scrollValues.at(-1)?.scrollY);
    });
});
