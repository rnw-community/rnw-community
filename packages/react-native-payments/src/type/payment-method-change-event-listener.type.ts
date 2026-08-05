import type { PaymentMethodChangeEvent } from '../class/payment-method-change-event/payment-method-change-event.js';
import type { OnEventFn } from '@rnw-community/shared';

export type PaymentMethodChangeEventListener = OnEventFn<PaymentMethodChangeEvent, Promise<void> | void>;
