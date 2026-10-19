import type { ComponentRef, RefObject } from 'react';
import type { LayoutChangeEvent, View } from 'react-native';

/**
 * The view props returned by `useBottomChromeHeightPublisher`, spread onto the bottom chrome node it measures.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#bottomchromeheightpublisherinterface
 */
export interface BottomChromeHeightPublisherInterface {
    /** Ref measured synchronously on mount, so the first frame already reserves the height. */
    readonly ref: RefObject<ComponentRef<typeof View> | null>;
    /** Layout handler that republishes the measured height on every resize. */
    readonly onLayout: (event: LayoutChangeEvent) => void;
}
