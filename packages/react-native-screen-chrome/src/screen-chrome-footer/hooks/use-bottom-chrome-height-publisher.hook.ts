import { useContext, useLayoutEffect, useRef } from 'react';

import { BottomChromeHeightSetterContext } from '../../context/bottom-chrome-height-setter.context';

import type { RefObject } from 'react';
import type { LayoutChangeEvent, View } from 'react-native';

interface BottomChromeHeightPublisherInterface {
    readonly contentRef: RefObject<View | null>;
    readonly onContentLayout: (event: LayoutChangeEvent) => void;
}

export const useBottomChromeHeightPublisher = (): BottomChromeHeightPublisherInterface => {
    const publishHeight = useContext(BottomChromeHeightSetterContext);
    const contentRef = useRef<View>(null);

    useLayoutEffect(() => {
        contentRef.current?.measure((_x, _y, _width, height) => {
            publishHeight(height);
        });

        return () => {
            publishHeight(0);
        };
    }, [publishHeight]);

    const onContentLayout = (event: LayoutChangeEvent): void => {
        publishHeight(event.nativeEvent.layout.height);
    };

    return { contentRef, onContentLayout };
};
