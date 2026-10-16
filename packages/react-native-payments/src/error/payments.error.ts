import { formatPaymentsErrorMessage } from '../util/format-payments-error-message.util';

/**
 * The domain error for native bridge and payload parsing failures the W3C spec does not name.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/payments-error.md
 */
export class PaymentsError extends Error {
    constructor(message: string) {
        super(formatPaymentsErrorMessage(message));
    }
}
