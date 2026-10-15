import { PaymentRequest } from '../../class/payment-request/payment-request';

import type { PaymentRequestFactoryConfig } from '../../interface/payment-request-factory-config.interface';
import type { PaymentRequestFactory } from '../../type/payment-request-factory.type';

/**
 * Creates a function that builds a fresh single-use `PaymentRequest` per checkout from shared method data and base details.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/create-payment-request-factory.md
 * @see https://www.w3.org/TR/payment-request/#constructor
 */
export const createPaymentRequestFactory =
    ({ methodData, details: baseDetails }: PaymentRequestFactoryConfig): PaymentRequestFactory =>
    details =>
        new PaymentRequest([...methodData], { ...baseDetails, ...details });
