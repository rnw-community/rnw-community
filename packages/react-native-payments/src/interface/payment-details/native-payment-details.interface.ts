import type { AndroidPaymentDetailsInterface } from './android-payment-details.interface';
import type { IOSPaymentDetailsInterface } from './ios-payment-details.interface';
import type { PaymentAddress } from '../payment-address';
import type { PaymentShippingOption } from '../payment-shipping-options';

export interface NativePaymentDetailsInterface extends AndroidPaymentDetailsInterface, IOSPaymentDetailsInterface {
    payerEmail?: string;
    payerName?: string;
    payerPhone?: string;
    shippingAddress?: PaymentAddress;
    shippingOption?: PaymentShippingOption;
}
