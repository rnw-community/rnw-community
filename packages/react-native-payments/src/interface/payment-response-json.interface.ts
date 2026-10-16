import type { PaymentResponseAddressInterface } from './payment-response-address.interface';
import type { PaymentResponseDetailsInterface } from './payment-response-details.interface';
import type { Maybe } from '@rnw-community/shared';

/**
 * The serialized shape returned by `PaymentResponse.toJSON()`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/payment-response-json.md
 * @see https://www.w3.org/TR/payment-request/#idl-def-paymentresponse-tojson
 */
export interface PaymentResponseJsonInterface {
    details: PaymentResponseDetailsInterface;
    methodName: string;
    payerEmail: Maybe<string>;
    payerName: Maybe<string>;
    payerPhone: Maybe<string>;
    requestId: string;
    shippingAddress: Maybe<PaymentResponseAddressInterface>;
    shippingOption: Maybe<string>;
}
