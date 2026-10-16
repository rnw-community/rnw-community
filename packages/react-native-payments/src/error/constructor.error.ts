import { formatPaymentsErrorMessage } from '../util/format-payments-error-message.util';

/**
 * The `TypeError` thrown by `new PaymentRequest(...)` when its input fails W3C validation.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/constructor-error.md
 * @see https://www.w3.org/TR/payment-request/#constructor
 */
export class ConstructorError extends TypeError {
    constructor(message: string) {
        super(formatPaymentsErrorMessage(`Failed to construct 'PaymentRequest': ${message}`));
    }
}
