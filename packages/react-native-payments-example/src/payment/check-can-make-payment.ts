import { getErrorMessage } from '@rnw-community/shared';

import { formatLogMessage } from '../util/format-log-message.js';

import { createPaymentRequest } from './create-payment-request.js';

import type { RequestOptionsInterface } from '../interface/request-options.interface.js';
import type { OnEventFn } from '@rnw-community/shared';

export const checkCanMakePayment = async (
    options: RequestOptionsInterface,
    log: OnEventFn<string>,
    setStatus: OnEventFn<string>
): Promise<void> => {
    try {
        const canMakePayment = await createPaymentRequest(options).canMakePayment();
        const status = canMakePayment ? 'available' : 'unavailable';

        setStatus(status);
        log(formatLogMessage('canMakePayment', { status }));
    } catch (error) {
        setStatus('error');
        log(formatLogMessage('canMakePayment failed', { error: getErrorMessage(error) }));
    }
};
