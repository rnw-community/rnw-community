/**
 * The W3C `DOMException` names this library assigns to `error.name`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/payments-error-enum.md
 * @see https://webidl.spec.whatwg.org/#idl-DOMException-error-names
 */
export enum PaymentsErrorEnum {
    AbortError = 'AbortError',
    InvalidStateError = 'InvalidStateError',
    NotAllowedError = 'NotAllowedError',
    NotSupportedError = 'NotSupportedError',
    SecurityError = 'SecurityError',
}
