import type { PaymentRequestUpdateEvent } from '../class/payment-request-update-event/payment-request-update-event';
import type { OnEventFn } from '@rnw-community/shared';

/**
 * The listener signature for a payment request change event, receiving a `PaymentRequestUpdateEvent`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/events-types.md
 */
export type PaymentRequestEventListener = OnEventFn<PaymentRequestUpdateEvent, Promise<void> | void>;
