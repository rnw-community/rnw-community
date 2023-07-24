export interface IosPKToken {
    /*
     * https://developer.apple.com/documentation/passkit/pkpaymenttoken/1617000-paymentdata?language=objc
     * Send this data to your e-commerce back-end system, where it can be decrypted and submitted to your payment processor.
     */
    paymentData: string;
    paymentMethod: {
        displayName: string;
        network: string;
        type: string;
    };
    transactionIdentifier: string;
}
