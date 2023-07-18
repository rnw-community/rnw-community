// https://developers.google.com/pay/api/android/reference/request-objects#PaymentMethodTokenizationSpecification
export interface AndroidTokenizationDirectSpecification {
    parameters: {
        protocolVersion: string;
        publicKey: string;
    };
    // https://developers.google.com/pay/api/android/reference/request-objects#direct
    type: 'DIRECT';
}
