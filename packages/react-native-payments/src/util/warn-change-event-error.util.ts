import { getErrorMessage } from '@rnw-community/shared';

export const warnChangeEventError = (error: unknown): void => {
    // eslint-disable-next-line no-console
    console.warn(`[ReactNativePayments] Payment change event failed: ${getErrorMessage(error, 'Unknown error')}`);
};
