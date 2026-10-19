import { useContext, useLayoutEffect, useRef, useState } from 'react';

import { isDefined } from '@rnw-community/shared';

import { BottomChromeHeightSetterContext } from '../../context/bottom-chrome-height-setter.context';

import type { BottomChromeHeightPublisherOptionsInterface } from '../../interface/bottom-chrome-height-publisher-options.interface';
import type { BottomChromeHeightPublisherInterface } from '../../interface/bottom-chrome-height-publisher.interface';
import type { LayoutChangeEvent, View } from 'react-native';

/**
 * Publishes a bottom chrome height, measured from the returned view props or declared, for `useBottomChromeInset` consumers.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#usebottomchromeheightpublisher
 */
export const useBottomChromeHeightPublisher = ({
    height,
}: BottomChromeHeightPublisherOptionsInterface = {}): BottomChromeHeightPublisherInterface => {
    const { publish, withdraw } = useContext(BottomChromeHeightSetterContext);
    const [chromeId] = useState(() => Symbol('bottom-chrome'));
    const ref = useRef<View>(null);

    useLayoutEffect(
        () => () => {
            withdraw(chromeId);
        },
        [chromeId, withdraw]
    );

    useLayoutEffect(() => {
        if (isDefined(height)) {
            publish(chromeId, height);
        } else {
            ref.current?.measure((_x, _y, _width, measuredHeight) => {
                publish(chromeId, measuredHeight);
            });
        }
    }, [chromeId, height, publish]);

    const onLayout = (event: LayoutChangeEvent): void => {
        if (!isDefined(height)) {
            publish(chromeId, event.nativeEvent.layout.height);
        }
    };

    return { ref, onLayout };
};
