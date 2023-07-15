export interface IOSPaymentDetailsInterface {
    // TODO: Add type
    billingContact?: Record<string, string>;
    // TODO: Add type
    paymentData: Record<string, string>;
    // TODO: Add type
    paymentMethod: Record<string, string>;
    // TODO: Add type
    shippingContact?: Record<string, string>;
    transactionIdentifier: string;
}
