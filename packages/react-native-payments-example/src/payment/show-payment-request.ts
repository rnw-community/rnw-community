import { getErrorMessage } from '@rnw-community/shared';

import { formatLogMessage } from '../util/format-log-message';

import { completePaymentResponse } from './complete-payment-response';

import type { PaymentRequest } from '@rnw-community/react-native-payments';
import type { OnEventFn } from '@rnw-community/shared';

export const showPaymentRequest = async (
    request: PaymentRequest,
    log: OnEventFn<string>,
    setFlowState: OnEventFn<string>
): Promise<void> => {
    log(formatLogMessage('show called', { id: request.id }));

    try {
        const response = await request.show();

        setFlowState('accepted');
        log(formatLogMessage('show accepted', { method: response.methodName }));

        await completePaymentResponse(response, log);
    } catch (error) {
        setFlowState('rejected');
        log(formatLogMessage('show rejected', { error: getErrorMessage(error) }));
    }
};
