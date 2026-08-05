import { WebSelectorConfig } from '../config/index.js';

export const webTestIDSelector = (testID: string): string => `[${WebSelectorConfig}="${testID}"]`;
