export interface IOSRawPaymentDetailsInterface {
    billingContact?: string;
    paymentData: string;
    // TODO: Add type
    paymentMethod: Record<string, string>;
    paymentToken?: string;
    shippingContact?: string;
    transactionIdentifier: string;
}
