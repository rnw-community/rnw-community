import { wait } from '@rnw-community/shared';

import { asyncUpdateLatencyMs } from '../constant/async-update-latency-ms';
import { formatLogMessage } from '../util/format-log-message';

import { getDetailsUpdate } from './get-details-update';

import type { RequestOptionsInterface } from '../interface/request-options.interface';
import type {
    PaymentDetailsUpdate,
    PaymentRequest,
    PaymentRequestEventType,
    PaymentRequestUpdateEvent,
} from '@rnw-community/react-native-payments';
import type { OnEventFn } from '@rnw-community/shared';

const getUpdateSummary = (detailsUpdate: PaymentDetailsUpdate): Record<string, string | undefined> => ({
    shipping: detailsUpdate.shippingOptions?.find(option => option.selected === true)?.id,
    total: detailsUpdate.total?.amount.value,
});

const getAsyncDetailsUpdate = async (
    type: PaymentRequestEventType,
    detailsUpdate: PaymentDetailsUpdate,
    log: OnEventFn<string>
): Promise<PaymentDetailsUpdate> => {
    await wait(asyncUpdateLatencyMs);

    log(formatLogMessage(`${type} updateWith settled`, getUpdateSummary(detailsUpdate)));

    return detailsUpdate;
};

export const answerChangeEvent = (
    event: PaymentRequestUpdateEvent,
    request: PaymentRequest,
    options: RequestOptionsInterface,
    log: OnEventFn<string>
): void => {
    const detailsUpdate = getDetailsUpdate(options, request.shippingOption);
    const summary = getUpdateSummary(detailsUpdate);

    if (!options.asyncUpdate) {
        log(formatLogMessage(`${event.type} updateWith`, { mode: 'sync', ...summary }));
        event.updateWith(detailsUpdate);

        return;
    }

    log(
        formatLogMessage(`${event.type} updateWith started`, {
            latencyMs: asyncUpdateLatencyMs,
            mode: 'async',
            ...summary,
        })
    );
    event.updateWith(getAsyncDetailsUpdate(event.type, detailsUpdate, log));
};
