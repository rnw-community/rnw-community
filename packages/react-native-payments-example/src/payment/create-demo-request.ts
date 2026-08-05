import { getErrorMessage } from '@rnw-community/shared';

import { formatLogMessage } from '../util/format-log-message.js';

import { attachChangeListeners } from './attach-change-listeners.js';
import { createPaymentRequest } from './create-payment-request.js';

import type { RequestOptionsInterface } from '../interface/request-options.interface.js';
import type { PaymentRequest } from '@rnw-community/react-native-payments';
import type { Maybe, OnEventFn } from '@rnw-community/shared';

export const createDemoRequest = (options: RequestOptionsInterface, log: OnEventFn<string>): Maybe<PaymentRequest> => {
    try {
        const request = createPaymentRequest(options);

        log(formatLogMessage('request created', { id: request.id, total: options.totalValue }));
        attachChangeListeners(request, options, log);

        return request;
    } catch (error) {
        log(formatLogMessage('request failed', { error: getErrorMessage(error) }));

        return null;
    }
};
