import type { AndroidPaymentMethodCardParameters } from './android-payment-method-card-parameters';
import type { AndroidTokenizationDirectSpecification } from './android-tokenization-direct-specification';
import type { AndroidTokenizationGatewaySpecification } from './android-tokenization-gateway-specification';

// https://developers.google.com/pay/api/android/reference/request-objects#PaymentMethod
export interface AndroidPaymentMethod {
    parameters: AndroidPaymentMethodCardParameters;
    tokenizationSpecification?: AndroidTokenizationDirectSpecification | AndroidTokenizationGatewaySpecification;
    type: 'CARD';
}
