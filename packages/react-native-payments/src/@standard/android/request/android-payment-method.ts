import { AndroidAllowedAuthMethodsEnum } from '../enum/android-allowed-auth-methods.enum.js';

import type { AndroidPaymentMethodCardParameters } from './android-payment-method-card-parameters.js';
import type { AndroidTokenizationDirectSpecification } from './android-tokenization-direct-specification.js';
import type { AndroidTokenizationGatewaySpecification } from './android-tokenization-gateway-specification.js';

// https://developers.google.com/pay/api/android/reference/request-objects#PaymentMethod
export interface AndroidPaymentMethod {
    parameters: AndroidPaymentMethodCardParameters;
    tokenizationSpecification?: AndroidTokenizationDirectSpecification | AndroidTokenizationGatewaySpecification;
    type: 'CARD';
}

export const defaultAndroidPaymentMethod: AndroidPaymentMethod = {
    parameters: {
        allowedAuthMethods: [AndroidAllowedAuthMethodsEnum.PAN_ONLY, AndroidAllowedAuthMethodsEnum.CRYPTOGRAM_3DS],
        allowedCardNetworks: [],
    },
    type: 'CARD',
};
