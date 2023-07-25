// https://developer.apple.com/documentation/passkit/apple_pay/payment_token_format_reference?language=objc
export interface IosPaymentDataHeader {
    applicationData?: string;
    ephemeralPublicKey: string;
    publicKeyHash: string;
    transactionId: string;
    wrappedKey: string;
}

export const emptyIosPaymentDataHeader: IosPaymentDataHeader = {
    applicationData: '',
    ephemeralPublicKey: '',
    publicKeyHash: '',
    transactionId: '',
    wrappedKey: '',
};
