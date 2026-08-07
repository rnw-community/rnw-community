import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React, { useEffect } from 'react';
import * as Reanimated from 'react-native-reanimated';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant.js';
import { ColorSchemeEnum } from '../enum/color-scheme.enum.js';
import { useScreenChrome } from '../hook/use-screen-chrome.hook.js';

import { ScreenChromeProvider } from './screen-chrome-provider.js';

import type { ScreenChromeContextValueInterface } from '../interface/screen-chrome-context-value.interface.js';
import type { ReactNode } from 'react';

jest.mock('react-native-reanimated', () => {
    const actual = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');

    return {
        ...actual,
        scrollTo: jest.fn(),
        useAnimatedScrollHandler: jest.fn(handlers => handlers),
        useReducedMotion: jest.fn(() => false),
        useScrollViewOffset: jest.fn(() => actual.useSharedValue(0)),
    };
});

const LOWER_INSIDE_OFFSET = 39;
const UPPER_INSIDE_OFFSET = 41;
const MOMENTUM_VELOCITY = 0.05;
const OVERRIDDEN_HEADER_HEIGHT = 72;
const CUSTOM_MASK_STOP_POSITION = 0.25;
const OUTSIDE_COLLAPSE_OFFSET = 100;

interface ConsumerProps {
    readonly onValue: (value: ScreenChromeContextValueInterface) => void;
}

interface SubjectProps {
    readonly children?: ReactNode;
    readonly colorScheme?: ColorSchemeEnum;
    readonly config?: Parameters<typeof ScreenChromeProvider>[0]['config'];
}

interface ScreenChromeScrollEvent {
    readonly contentOffset: {
        readonly y: number;
    };
    readonly velocity?: {
        readonly y: number;
    };
}

interface TestScrollHandler {
    readonly onEndDrag: (event: ScreenChromeScrollEvent) => void;
    readonly onMomentumEnd: (event: ScreenChromeScrollEvent) => void;
}

const scrollToMock = jest.mocked(Reanimated.scrollTo);
const useReducedMotionMock = jest.mocked(Reanimated.useReducedMotion);

const isTestScrollHandler = (value: unknown): value is TestScrollHandler => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    return 'onEndDrag' in value && 'onMomentumEnd' in value;
};

const Consumer = ({ onValue }: ConsumerProps) => {
    const value = useScreenChrome();

    useEffect(() => {
        onValue(value);
    }, [onValue, value]);

    return null;
};

const Subject = ({ children, colorScheme, config }: SubjectProps) => (
    <ScreenChromeProvider colorScheme={colorScheme} config={config}>
        {children}
    </ScreenChromeProvider>
);

const captureContext = (props: Omit<SubjectProps, 'children'> = {}) => {
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

const dispatchEndDrag = (context: ScreenChromeContextValueInterface, offsetY: number, velocityY = 0): void => {
    const { scrollHandler } = context;

    if (!isTestScrollHandler(scrollHandler)) {
        throw new Error('ScreenChromeProvider did not expose test scroll handlers');
    }

    scrollHandler.onEndDrag({
        contentOffset: { y: offsetY },
        velocity: { y: velocityY },
    });
};

const dispatchMomentumEnd = (context: ScreenChromeContextValueInterface, offsetY: number): void => {
    const { scrollHandler } = context;

    if (!isTestScrollHandler(scrollHandler)) {
        throw new Error('ScreenChromeProvider did not expose test scroll handlers');
    }

    scrollHandler.onMomentumEnd({
        contentOffset: { y: offsetY },
    });
};

beforeEach(() => {
    scrollToMock.mockClear();
    useReducedMotionMock.mockReturnValue(false);
});

describe('ScreenChromeProvider context', () => {
    it('provides the default light scheme and native config', () => {
        const context = captureContext();

        expect(context.colorScheme).toBe(ColorSchemeEnum.LIGHT);
        expect(context.config).toEqual(SCREEN_CHROME_DEFAULT_CONFIG);
        expect(context.scrollY.get()).toBe(0);
    });

    it('provides supplied scheme and deep config overrides', () => {
        const context = captureContext({
            colorScheme: ColorSchemeEnum.DARK,
            config: {
                headerHeight: OVERRIDDEN_HEADER_HEIGHT,
                colors: {
                    [ColorSchemeEnum.DARK]: {
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

        expect(context.colorScheme).toBe(ColorSchemeEnum.DARK);
        expect(context.config.headerHeight).toBe(OVERRIDDEN_HEADER_HEIGHT);
        expect(context.config.colors[ColorSchemeEnum.DARK]).toEqual({
            ...SCREEN_CHROME_DEFAULT_CONFIG.colors[ColorSchemeEnum.DARK],
            solid: 'black',
        });
        expect(context.config.maskStops.top[CUSTOM_MASK_STOP_POSITION]).toEqual({ color: 'rgba(0,0,0,0.25)' });
        expect(context.config.maskStops.bottom).toEqual(SCREEN_CHROME_DEFAULT_CONFIG.maskStops.bottom);
    });

    it('keeps context identity stable across child-only rerenders', () => {
        const values: ScreenChromeContextValueInterface[] = [];
        const { rerender } = render(
            <Subject>
                <Consumer
                    onValue={value => {
                        values.push(value);
                    }}
                />
            </Subject>
        );

        rerender(
            <Subject>
                <Consumer
                    onValue={value => {
                        values.push(value);
                    }}
                />
            </Subject>
        );

        expect(values.at(0)).toBe(values.at(-1));
    });

    it('creates provider-owned animated scroll primitives', () => {
        const firstContext = captureContext();
        const secondContext = captureContext();

        expect(firstContext.scrollRef).toBeDefined();
        expect(firstContext.scrollY).toBeDefined();
        expect(firstContext.scrollHandler).toBeDefined();
        expect(firstContext.scrollRef).not.toBe(secondContext.scrollRef);
        expect(firstContext.scrollY).not.toBe(secondContext.scrollY);
    });
});

describe('ScreenChromeProvider snapping', () => {
    it.each([
        0,
        SCREEN_CHROME_DEFAULT_CONFIG.collapseStart,
        SCREEN_CHROME_DEFAULT_CONFIG.collapseEnd,
        OUTSIDE_COLLAPSE_OFFSET,
    ])(
        'does not snap outside or at endpoint %s',
        offsetY => {
            const context = captureContext({ config: { snapToCollapse: true } });

            dispatchEndDrag(context, offsetY);

            expect(scrollToMock).not.toHaveBeenCalled();
        }
    );

    it('snaps lower-half offsets to collapse start', () => {
        const context = captureContext({ config: { snapToCollapse: true } });

        dispatchEndDrag(context, LOWER_INSIDE_OFFSET);

        expect(scrollToMock).toHaveBeenCalledWith(context.scrollRef, 0, SCREEN_CHROME_DEFAULT_CONFIG.collapseStart, true);
    });

    it('snaps upper-half offsets to collapse end', () => {
        const context = captureContext({ config: { snapToCollapse: true } });

        dispatchEndDrag(context, UPPER_INSIDE_OFFSET);

        expect(scrollToMock).toHaveBeenCalledWith(context.scrollRef, 0, SCREEN_CHROME_DEFAULT_CONFIG.collapseEnd, true);
    });

    it('defers drag-end snapping when velocity has residual momentum', () => {
        const context = captureContext({ config: { snapToCollapse: true } });

        dispatchEndDrag(context, LOWER_INSIDE_OFFSET, MOMENTUM_VELOCITY);

        expect(scrollToMock).not.toHaveBeenCalled();
    });

    it('snaps deferred momentum at momentum end', () => {
        const context = captureContext({ config: { snapToCollapse: true } });

        dispatchEndDrag(context, LOWER_INSIDE_OFFSET, MOMENTUM_VELOCITY);
        dispatchMomentumEnd(context, LOWER_INSIDE_OFFSET);

        expect(scrollToMock).toHaveBeenCalledWith(context.scrollRef, 0, SCREEN_CHROME_DEFAULT_CONFIG.collapseStart, true);
    });

    it('uses non-animated scrolling when reduced motion is enabled', () => {
        useReducedMotionMock.mockReturnValue(true);
        const context = captureContext({ config: { snapToCollapse: true } });

        dispatchEndDrag(context, LOWER_INSIDE_OFFSET);

        expect(scrollToMock).toHaveBeenCalledWith(context.scrollRef, 0, SCREEN_CHROME_DEFAULT_CONFIG.collapseStart, false);
    });
});
