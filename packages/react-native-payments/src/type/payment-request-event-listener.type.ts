import type { PaymentRequestUpdateEvent } from '../class/payment-request-update-event/payment-request-update-event.js';
import type { OnEventFn } from '@rnw-community/shared';

export type PaymentRequestEventListener = OnEventFn<PaymentRequestUpdateEvent, Promise<void> | void>;
