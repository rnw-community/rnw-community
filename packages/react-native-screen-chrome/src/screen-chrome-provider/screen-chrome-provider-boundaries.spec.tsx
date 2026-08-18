import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React, { useEffect } from 'react';
import * as Reanimated from 'react-native-reanimated';

import { MOMENTUM_VELOCITY_EPSILON } from '../constant/momentum-velocity-epsilon.constant';
import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';
import { useScreenChrome } from '../hook/use-screen-chrome.hook';

import { ScreenChromeProvider } from './screen-chrome-provider';

import type { ScreenChromeContextValueInterface } from '../interface/screen-chrome-context-value.interface';
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

const CUSTOM_COLLAPSE_START = 20;
const CUSTOM_COLLAPSE_END = 100;
const CUSTOM_LOWER_INSIDE_OFFSET = 50;
const CUSTOM_CONFIG = {
    snapToCollapse: true,
    collapseStart: CUSTOM_COLLAPSE_START,
    smallTitleStart: 50,
    largeTitleEnd: 70,
    collapseEnd: CUSTOM_COLLAPSE_END,
};

interface ConsumerProps {
    readonly onValue: (value: ScreenChromeContextValueInterface) => void;
}

interface SubjectProps {
    readonly children?: ReactNode;
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
}

const scrollToMock = jest.mocked(Reanimated.scrollTo);

const isTestScrollHandler = (value: unknown): value is TestScrollHandler => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    return 'onEndDrag' in value;
};

const Consumer = ({ onValue }: ConsumerProps) => {
    const value = useScreenChrome();

    useEffect(() => {
        onValue(value);
    }, [onValue, value]);

    return null;
};

const Subject = ({ children, config }: SubjectProps) => (
    <ScreenChromeProvider config={config}>{children}</ScreenChromeProvider>
);

const captureContext = (config: SubjectProps['config']): ScreenChromeContextValueInterface => {
    const values: ScreenChromeContextValueInterface[] = [];

    render(
        <Subject config={config}>
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

beforeEach(() => {
    scrollToMock.mockClear();
});

describe('ScreenChromeProvider snap boundaries', () => {
    it('snaps an exact midpoint tie to collapse end', () => {
        const context = captureContext({ snapToCollapse: true });
        const midpoint = (SCREEN_CHROME_DEFAULT_CONFIG.collapseStart + SCREEN_CHROME_DEFAULT_CONFIG.collapseEnd) / 2;

        dispatchEndDrag(context, midpoint);

        expect(scrollToMock).toHaveBeenCalledWith(context.scrollRef, 0, SCREEN_CHROME_DEFAULT_CONFIG.collapseEnd, true);
    });

    it('snaps within a custom non-zero collapse interval', () => {
        const context = captureContext(CUSTOM_CONFIG);

        dispatchEndDrag(context, CUSTOM_LOWER_INSIDE_OFFSET);

        expect(scrollToMock).toHaveBeenCalledWith(context.scrollRef, 0, CUSTOM_COLLAPSE_START, true);
    });

    it('uses updated collapse thresholds after a provider rerender', () => {
        const values: ScreenChromeContextValueInterface[] = [];
        const onValue = (value: ScreenChromeContextValueInterface): void => {
            values.push(value);
        };
        const screen = render(
            <Subject config={{ snapToCollapse: true }}>
                <Consumer onValue={onValue} />
            </Subject>
        );

        screen.rerender(
            <Subject config={CUSTOM_CONFIG}>
                <Consumer onValue={onValue} />
            </Subject>
        );
        const context = values[values.length - 1];

        dispatchEndDrag(context, CUSTOM_LOWER_INSIDE_OFFSET);

        expect(scrollToMock).toHaveBeenCalledWith(context.scrollRef, 0, CUSTOM_COLLAPSE_START, true);
    });

    it.each([MOMENTUM_VELOCITY_EPSILON, -MOMENTUM_VELOCITY_EPSILON])(
        'defers drag-end snapping at momentum epsilon %s',
        velocityY => {
            const context = captureContext({ snapToCollapse: true });

            dispatchEndDrag(context, CUSTOM_LOWER_INSIDE_OFFSET, velocityY);

            expect(scrollToMock).not.toHaveBeenCalled();
        }
    );
});
