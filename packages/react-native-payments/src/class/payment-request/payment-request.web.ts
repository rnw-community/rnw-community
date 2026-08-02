import type { WebPaymentRequestConstructor } from '../../type/web-payment-request-constructor.type';

export const { PaymentRequest }: { PaymentRequest: WebPaymentRequestConstructor | null } =
    typeof window === 'undefined' ? { PaymentRequest: null } : window;
