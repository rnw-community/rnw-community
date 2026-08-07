import { createContext } from 'react';

import type { ScreenChromeContextValueInterface } from '../interface/screen-chrome-context-value.interface.js';

/**
 * Provides the resolved screen chrome context value to package components and hooks.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromecontext
 */
export const ScreenChromeContext = createContext<ScreenChromeContextValueInterface | null>(null);
