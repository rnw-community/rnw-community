import { formatPaymentsErrorMessage } from '../util/format-payments-error-message.util';

export class ConstructorError extends TypeError {
    constructor(message: string) {
        super(formatPaymentsErrorMessage(`Failed to construct 'PaymentRequest':  ${message}`));
    }
}
