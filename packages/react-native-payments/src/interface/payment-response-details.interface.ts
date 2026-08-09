import type { PaymentResponseAddressInterface } from './payment-response-address.interface.js';
import type { AndroidPaymentMethodToken } from '../@standard/android/response/android-payment-method-token.js';
import type { IosPKToken } from '../@standard/ios/response/ios-pk-token.js';

export interface PaymentResponseDetailsInterface {
    androidPayToken: AndroidPaymentMethodToken;
    applePayToken: IosPKToken;
    billingAddress?: PaymentResponseAddressInterface;
    payerEmail?: string;
    payerName?: string;
    payerPhone?: string;
    shippingAddress?: PaymentResponseAddressInterface;
}
