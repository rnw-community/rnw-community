// https://www.w3.org/TR/payment-request/#dom-paymentvalidationerrors
export interface PaymentValidationErrors {
    error: string;
    // TODO: Add type
    object: Record<string, string>;
}
