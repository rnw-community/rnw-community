import type { AndroidPaymentDataToken } from '../@standard/android/response/android-payment-data-token';

export interface PaymentResponseInterface {
    // TODO: Add generic address type
    billingAddress?: {};
    // TODO: Add IOS
    details: AndroidPaymentDataToken;
    payerEmail?: string;
    payerName?: string;
    payerPhone?: string;
    // TODO: Add generic address type
    shippingAddress?: {};
}
