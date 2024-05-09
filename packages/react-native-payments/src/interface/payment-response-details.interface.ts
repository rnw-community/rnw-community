import type { PaymentResponseAddressInterface } from './payment-response-address.interface';
import type { AndroidPaymentMethodToken } from '../@standard/android/response/android-payment-method-token';
import type { IosPKToken } from '../@standard/ios/response/ios-pk-token';
import { IosNSPersonNameComponents } from '../@standard/ios/response/ios-ns-person-name-components';

// TODO: Should we make this mo like
export interface PaymentResponseDetailsInterface {
    name: string | IosNSPersonNameComponents;
    androidPayToken: AndroidPaymentMethodToken;
    applePayToken: IosPKToken;
    billingAddress?: PaymentResponseAddressInterface;
    payerEmail?: string;
    payerName?: string;
    payerPhone?: string;
    shippingAddress?: PaymentResponseAddressInterface;
}
