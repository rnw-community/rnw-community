/**
 * The Google Pay `BillingAddressParameters` request shape.
 *
 * @see https://developers.google.com/pay/api/android/reference/request-objects#BillingAddressParameters
 */
export interface AndroidBillingAddressParameters {
    format?: 'FULL' | 'MIN';
    phoneNumberRequired?: boolean;
}
