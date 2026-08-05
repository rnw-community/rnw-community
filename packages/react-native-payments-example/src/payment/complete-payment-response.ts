import { PaymentComplete } from '@rnw-community/react-native-payments';
import { getErrorMessage } from '@rnw-community/shared';

import { formatLogMessage } from '../util/format-log-message.js';

import type { PaymentResponse } from '@rnw-community/react-native-payments';
import type { OnEventFn } from '@rnw-community/shared';

export const completePaymentResponse = async (response: PaymentResponse, log: OnEventFn<string>): Promise<void> => {
    log(formatLogMessage('complete called', { result: PaymentComplete.SUCCESS }));

    try {
        await response.complete(PaymentComplete.SUCCESS);

        log(formatLogMessage('complete resolved'));
    } catch (error) {
        log(formatLogMessage('complete failed', { error: getErrorMessage(error) }));
    }
};
