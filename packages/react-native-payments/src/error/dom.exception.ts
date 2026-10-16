import { PaymentsErrorEnum } from '../enum/payments-error.enum';

import { PaymentsError } from './payments.error';

/**
 * The W3C `DOMException` thrown for request state violations and abort or not-supported conditions, named by `PaymentsErrorEnum`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/dom-exception.md
 * @see https://webidl.spec.whatwg.org/#idl-DOMException
 */
export class DOMException extends PaymentsError {
    private static readonly messages: Record<PaymentsErrorEnum, string> = {
        [PaymentsErrorEnum.AbortError]: 'The operation was aborted.',
        [PaymentsErrorEnum.InvalidStateError]: 'The object is in an invalid state.',
        [PaymentsErrorEnum.NotAllowedError]:
            'The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.',
        [PaymentsErrorEnum.NotSupportedError]: 'The operation is not supported.',
        [PaymentsErrorEnum.SecurityError]: 'The operation is insecure.',
    };

    constructor(errorType: PaymentsErrorEnum) {
        super(`[DOMException]: ${DOMException.messages[errorType]}`);
        this.name = errorType;
    }
}
