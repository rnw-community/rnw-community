import type { AndroidPaymentDetailsInterface } from './android/android-payment-details.interface';
import type { PaymentAddress } from '../payment-address';

export interface NativePaymentDetailsInterface extends AndroidPaymentDetailsInterface {
    payerEmail?: string;
    payerName?: string;
    payerPhone?: string;
    shippingAddress?: PaymentAddress;
    shippingOption?: string;
}
