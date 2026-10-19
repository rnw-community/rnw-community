import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import { useContext } from 'react';

import { CollapsibleHeaderScrollContext } from '../../context/collapsible-header-scroll.context';
import { CollapsibleHeaderProvider } from '../../provider/collapsible-header-provider/collapsible-header-provider';

import { useCollapsibleHeaderSnapRegistration } from './use-collapsible-header-snap-registration.hook';

import type { CollapsibleHeaderScrollContextValue } from '../../interface/collapsible-header-scroll-context-value.interface';

const SNAP_START = 20;
const SNAP_END = 100;
const SNAP_CONFIG = { snapStart: SNAP_START, snapEnd: SNAP_END };

const captureStableScrollContext = (): CollapsibleHeaderScrollContextValue => {
    const { result } = renderHook(() => useContext(CollapsibleHeaderScrollContext), {
        wrapper: CollapsibleHeaderProvider,
    });
    const scrollContext = result.current;
    if (scrollContext === null) {
        throw new Error('CollapsibleHeaderProvider did not provide a scroll context');
    }

    return scrollContext;
};

const registerSnappingHeader = (scrollContext: CollapsibleHeaderScrollContextValue) =>
    renderHook(() => {
        useCollapsibleHeaderSnapRegistration(scrollContext, true, SNAP_START, SNAP_END);
    });

describe('useCollapsibleHeaderSnapRegistration', () => {
    it.each([
        { name: 'the last registered header', unmountedIndex: 1 },
        { name: 'the first registered header', unmountedIndex: 0 },
    ])('keeps the shared snap geometry registered when $name unmounts', ({ unmountedIndex }) => {
        expect.hasAssertions();
        const scrollContext = captureStableScrollContext();
        const headers = [registerSnappingHeader(scrollContext), registerSnappingHeader(scrollContext)];

        headers[unmountedIndex]?.unmount();

        expect(scrollContext.snapConfig.get()).toStrictEqual(SNAP_CONFIG);
    });

    it('clears the snap geometry once every snapping header unmounts', () => {
        expect.hasAssertions();
        const scrollContext = captureStableScrollContext();
        const firstHeader = registerSnappingHeader(scrollContext);
        const secondHeader = registerSnappingHeader(scrollContext);

        firstHeader.unmount();
        secondHeader.unmount();

        expect(scrollContext.snapConfig.get()).toBeNull();
    });
});
