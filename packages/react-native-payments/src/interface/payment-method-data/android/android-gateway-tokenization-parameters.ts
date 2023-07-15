export interface AndroidGatewayTokenizationParameters {
    parameters: {
        gateway: string;
        gatewayMerchantId: string;
    };
    tokenizationType: 'PAYMENT_METHOD_TOKENIZATION_TYPE_PAYMENT_GATEWAY';
}
