import type { AndroidPaymentDetailsInterface } from './android/android-payment-details.interface';
import type { IOSPaymentDetailsInterface } from './ios/ios-payment-details.interface';
import type { PaymentAddress } from '../payment-address';

export interface NativePaymentDetailsInterface extends AndroidPaymentDetailsInterface, IOSPaymentDetailsInterface {
    payerEmail?: string;
    payerName?: string;
    payerPhone?: string;
    shippingAddress?: PaymentAddress;
    shippingOption?: string;
}
