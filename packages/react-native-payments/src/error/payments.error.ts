import { formatPaymentsErrorMessage } from '../util/format-payments-error-message.util.js';

export class PaymentsError extends Error {
    constructor(message: string) {
        super(formatPaymentsErrorMessage(message));
    }
}
