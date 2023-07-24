import type { PaymentResponseAddressInterface } from './payment-response-address.interface';

export interface PaymentResponseDetailsInterface<TokenDetails> {
    billingAddress?: PaymentResponseAddressInterface;
    // TODO: Add IOS
    details: TokenDetails;
    payerEmail?: string;
    payerName?: string;
    payerPhone?: string;
    shippingAddress?: PaymentResponseAddressInterface;
}
