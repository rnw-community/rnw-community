import type { PaymentDetailsInit } from '../@standard/w3c/payment-details-init';
import type { PaymentRequest } from '../class/payment-request/payment-request';

/**
 * A function returned by `createPaymentRequestFactory` that builds a fresh single-use `PaymentRequest` per checkout attempt.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/create-payment-request-factory.md
 */
export type PaymentRequestFactory = (details: PaymentDetailsInit) => PaymentRequest;
