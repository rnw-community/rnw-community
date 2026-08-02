import type { WebPaymentResponseConstructor } from '../../type/web-payment-response-constructor.type';

export const { PaymentResponse }: { PaymentResponse: WebPaymentResponseConstructor | null } =
    typeof window === 'undefined' ? { PaymentResponse: null } : window;
