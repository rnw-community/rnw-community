import { formatLogMessage } from '../util/format-log-message';

import { answerChangeEvent } from './answer-change-event';
import { getChangeEventSummary } from './get-change-event-summary';

import type { RequestOptionsInterface } from '../interface/request-options.interface';
import type {
    PaymentRequest,
    PaymentRequestEventListener,
    PaymentRequestUpdateEvent,
} from '@rnw-community/react-native-payments';
import type { OnEventFn } from '@rnw-community/shared';

export const createChangeEventListener =
    (request: PaymentRequest, options: RequestOptionsInterface, log: OnEventFn<string>): PaymentRequestEventListener =>
    (event: PaymentRequestUpdateEvent): void => {
        log(formatLogMessage(event.type, getChangeEventSummary(event, request)));

        answerChangeEvent(event, request, options, log);
    };
