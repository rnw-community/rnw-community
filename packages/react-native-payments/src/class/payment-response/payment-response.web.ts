import type { WebPaymentResponseConstructor } from '../../type/web-payment-response-constructor.type';
import type { Maybe } from '@rnw-community/shared';


export const { PaymentResponse }: { PaymentResponse: Maybe<WebPaymentResponseConstructor> | undefined } =
    typeof window === 'undefined' ? { PaymentResponse: null } : window;
