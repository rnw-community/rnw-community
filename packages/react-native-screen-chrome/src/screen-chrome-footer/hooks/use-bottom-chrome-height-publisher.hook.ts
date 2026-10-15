import { useContext, useLayoutEffect, useRef, useState } from 'react';

import { BottomChromeHeightSetterContext } from '../../context/bottom-chrome-height-setter.context';

import type { RefObject } from 'react';
import type { LayoutChangeEvent, View } from 'react-native';

interface BottomChromeHeightPublisherInterface {
    readonly contentRef: RefObject<View | null>;
    readonly onContentLayout: (event: LayoutChangeEvent) => void;
}

export const useBottomChromeHeightPublisher = (): BottomChromeHeightPublisherInterface => {
    const { publish, withdraw } = useContext(BottomChromeHeightSetterContext);
    const [footerId] = useState(() => Symbol('bottom-chrome-footer'));
    const contentRef = useRef<View>(null);

    useLayoutEffect(() => {
        contentRef.current?.measure((_x, _y, _width, height) => {
            publish(footerId, height);
        });

        return () => {
            withdraw(footerId);
        };
    }, [footerId, publish, withdraw]);

    const onContentLayout = (event: LayoutChangeEvent): void => {
        publish(footerId, event.nativeEvent.layout.height);
    };

    return { contentRef, onContentLayout };
};
