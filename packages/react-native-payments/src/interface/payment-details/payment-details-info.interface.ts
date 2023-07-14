import type { PaymentAddress } from '../payment-address';
import type { PaymentShippingOption } from '../payment-shipping-options';

export interface PaymentDetailsInfoInterface {
    payerEmail?: string;
    payerName?: string;
    payerPhone?: string;
    shippingAddress?: PaymentAddress;
    shippingOption?: PaymentShippingOption;
}
