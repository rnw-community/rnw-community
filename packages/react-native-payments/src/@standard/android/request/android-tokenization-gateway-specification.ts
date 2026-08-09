import type { AndroidPaymentMethodTokenizationType } from '../enum/android-payment-method-tokenization-type.enum';

// https://developers.google.com/pay/api#participating-processors
export interface AndroidTokenizationGatewaySpecification {
    // https://developers.google.com/pay/api#participating-processors
    parameters: Record<string, string> & {
        gateway: string;
        gatewayMerchantId: string;
    };
    // https://developers.google.com/pay/api/android/reference/request-objects#gateway
    type: AndroidPaymentMethodTokenizationType.PAYMENT_GATEWAY;
}
