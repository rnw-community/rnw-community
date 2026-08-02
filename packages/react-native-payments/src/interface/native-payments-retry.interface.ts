import type { PaymentValidationErrors } from '../@standard/w3c/payment-validation-errors';

export interface NativePaymentsRetryInterface {
    retry?: (requestId: string, errorFields: PaymentValidationErrors) => Promise<void>;
}
