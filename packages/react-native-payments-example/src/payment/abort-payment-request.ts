import { getErrorMessage } from '@rnw-community/shared';

import { formatLogMessage } from '../util/format-log-message';

import type { PaymentRequest } from '@rnw-community/react-native-payments';
import type { OnEventFn } from '@rnw-community/shared';

export const abortPaymentRequest = async (request: PaymentRequest, log: OnEventFn<string>): Promise<void> => {
    log(formatLogMessage('abort called', { id: request.id }));

    try {
        await request.abort();

        log(formatLogMessage('abort resolved'));
    } catch (error) {
        log(formatLogMessage('abort rejected', { error: getErrorMessage(error) }));
    }
};
