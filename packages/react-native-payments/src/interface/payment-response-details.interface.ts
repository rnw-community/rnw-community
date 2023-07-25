import type { PaymentResponseAddressInterface } from './payment-response-address.interface';
import type { AndroidPaymentMethodToken } from '../@standard/android/response/android-payment-method-token';
import type { IosPKToken } from '../@standard/ios/response/ios-pk-token';

export interface PaymentResponseDetailsInterface {
    billingAddress?: PaymentResponseAddressInterface;
    details: {
        AndroidPay: AndroidPaymentMethodToken;
        ApplePay: IosPKToken;
    };
    payerEmail?: string;
    payerName?: string;
    payerPhone?: string;
    shippingAddress?: PaymentResponseAddressInterface;
}
