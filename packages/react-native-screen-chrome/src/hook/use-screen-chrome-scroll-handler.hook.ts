import { useScreenChrome } from './use-screen-chrome.hook.js';

/**
 * Returns the provider-owned scroll handler for custom scroll containers.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#usescreenchromescrollhandler
 */
export const useScreenChromeScrollHandler = () => useScreenChrome().scrollHandler;
