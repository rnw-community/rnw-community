import type { PaymentDetailsInit } from '../@standard/w3c/payment-details-init';
import type { PaymentMethodData } from '../@standard/w3c/payment-method-data';

/**
 * The configuration shared by every `PaymentRequest` a `createPaymentRequestFactory` factory builds.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/create-payment-request-factory.md
 */
export interface PaymentRequestFactoryConfig {
    /** The base details every request starts from, overridden key by key by the per-checkout details. */
    details?: Omit<PaymentDetailsInit, 'id' | 'total'>;
    /** The method data every request is built with. */
    methodData: readonly PaymentMethodData[];
}
