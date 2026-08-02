import type { PaymentResponseAddressInterface } from './payment-response-address.interface';
import type { PaymentResponseDetailsInterface } from './payment-response-details.interface';
import type { Maybe } from '@rnw-community/shared';

// https://www.w3.org/TR/payment-request/#dom-paymentresponse-tojson
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
