import type { PaymentResponseAddressInterface } from './payment-response-address.interface';

export interface PaymentRequestEventPayloadInterface {
    couponCode?: string;
    methodDetails?: Record<string, unknown>;
    methodName?: string;
    requestId: string;
    shippingAddress?: PaymentResponseAddressInterface;
    shippingOption?: string;
}
