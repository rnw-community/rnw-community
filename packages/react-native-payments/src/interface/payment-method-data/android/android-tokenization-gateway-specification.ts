// https://developers.google.com/pay/api#participating-processors
export interface AndroidTokenizationGatewaySpecification {
    // https://developers.google.com/pay/api#participating-processors
    parameters: {
        gateway: string;
        gatewayMerchantId: string;
    };
    // https://developers.google.com/pay/api/android/reference/request-objects#gateway
    type: 'PAYMENT_GATEWAY';
}
