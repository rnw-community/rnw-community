/**
 * The W3C payment completion result values passed to `PaymentResponse.complete()`.
 *
 * @see https://www.w3.org/TR/payment-request/#paymentcomplete-enum
 */
export enum PaymentComplete {
    FAIL = 'fail',
    SUCCESS = 'success',
    UNKNOWN = 'unknown',
}
