import { WebSelectorConfig } from '../config';

export const webTestIDSelector = (testID: string): string => `[${WebSelectorConfig}="${testID}"]`;
