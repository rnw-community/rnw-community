import { wait } from '@rnw-community/shared';

import { asyncUpdateLatencyMs } from '../constant/async-update-latency-ms';
import { formatLogMessage } from '../util/format-log-message';

import { getDetailsUpdate } from './get-details-update';

import type { RequestOptionsInterface } from '../interface/request-options.interface';
import type {
    PaymentDetailsUpdate,
    PaymentRequestEventType,
    PaymentRequestUpdateEvent,
} from '@rnw-community/react-native-payments';
import type { OnEventFn } from '@rnw-community/shared';

const getAsyncDetailsUpdate = async (
    type: PaymentRequestEventType,
    detailsUpdate: PaymentDetailsUpdate,
    log: OnEventFn<string>
): Promise<PaymentDetailsUpdate> => {
    await wait(asyncUpdateLatencyMs);

    log(formatLogMessage(`${type} updateWith settled`, { total: detailsUpdate.total?.amount.value }));

    return detailsUpdate;
};

export const answerChangeEvent = (
    event: PaymentRequestUpdateEvent,
    options: RequestOptionsInterface,
    log: OnEventFn<string>
): void => {
    const detailsUpdate = getDetailsUpdate(options);
    const total = detailsUpdate.total?.amount.value;

    if (!options.asyncUpdate) {
        log(formatLogMessage(`${event.type} updateWith`, { mode: 'sync', total }));
        event.updateWith(detailsUpdate);

        return;
    }

    log(formatLogMessage(`${event.type} updateWith started`, { latencyMs: asyncUpdateLatencyMs, mode: 'async', total }));
    event.updateWith(getAsyncDetailsUpdate(event.type, detailsUpdate, log));
};
