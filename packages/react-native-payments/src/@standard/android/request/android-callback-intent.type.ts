/**
 * The Google Pay `callbackIntents` values that route in-sheet changes to the app's payment data callbacks.
 *
 * @see https://developers.google.com/pay/api/android/reference/request-objects#PaymentDataRequest
 */
export type AndroidCallbackIntent = 'PAYMENT_AUTHORIZATION' | 'SHIPPING_ADDRESS' | 'SHIPPING_OPTION';
