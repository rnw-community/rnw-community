import type { PaymentDetailsUpdate } from '../@standard/w3c/payment-details-update';
import type { OnEventFn } from '@rnw-community/shared';

export type PaymentRequestUpdateHandler = OnEventFn<Promise<PaymentDetailsUpdate>>;
