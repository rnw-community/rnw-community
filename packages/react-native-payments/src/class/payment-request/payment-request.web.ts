import type { WebPaymentRequestConstructor } from '../../type/web-payment-request-constructor.type.js';
import type { Maybe } from '@rnw-community/shared';


export const { PaymentRequest }: { PaymentRequest: Maybe<WebPaymentRequestConstructor> | undefined } =
    typeof window === 'undefined' ? { PaymentRequest: null } : window;
