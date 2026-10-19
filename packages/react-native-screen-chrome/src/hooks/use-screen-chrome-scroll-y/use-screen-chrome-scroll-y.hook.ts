import { useCollapsibleHeaderScroll } from '@rnw-community/react-native-collapsible-header';

import { useScreenChrome } from '../use-screen-chrome/use-screen-chrome.hook';

import type { SharedValue } from 'react-native-reanimated';

/**
 * Returns the scroll offset driving the chrome: the provider's external `scrollY` when passed, otherwise the provider-owned one.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#usescreenchromescrolly
 */
export const useScreenChromeScrollY = (): SharedValue<number> => {
    const { externalScrollY } = useScreenChrome();
    const { scrollY: providerScrollY } = useCollapsibleHeaderScroll();

    return externalScrollY ?? providerScrollY;
};
