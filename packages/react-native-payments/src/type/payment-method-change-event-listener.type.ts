import type { PaymentMethodChangeEvent } from '../class/payment-method-change-event/payment-method-change-event';
import type { OnEventFn } from '@rnw-community/shared';

/**
 * The listener signature for `paymentmethodchange`, receiving a `PaymentMethodChangeEvent`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/events-types.md
 */
export type PaymentMethodChangeEventListener = OnEventFn<PaymentMethodChangeEvent, Promise<void> | void>;
