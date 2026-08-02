import type { PaymentResponseAddressInterface } from './payment-response-address.interface';

// Mirrors the PassKit delegate change callbacks: https://developer.apple.com/documentation/passkit/pkpaymentauthorizationcontrollerdelegate
export interface PaymentRequestEventPayloadInterface {
    couponCode?: string;
    eventId?: number;
    methodDetails?: Record<string, unknown>;
    methodName?: string;
    requestId: string;
    shippingAddress?: PaymentResponseAddressInterface;
    shippingOption?: string;
}
