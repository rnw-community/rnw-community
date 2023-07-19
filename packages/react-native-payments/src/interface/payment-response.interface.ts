import type { AndroidPaymentDataToken } from '../android/interface/response/android-payment-data-token';

export interface PaymentResponseInterface {
    // TODO: Add generic address type
    billingAddress?: {};
    // TODO: Add IOS
    details: AndroidPaymentDataToken;
    payerEmail?: string;
    payerName?: string;
    payerPhone?: string;
    requestId: string;
    // TODO: Add generic address type
    shippingAddress?: {};
}
