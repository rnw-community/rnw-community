// https://developers.google.com/pay/api/android/reference/request-objects#BillingAddressParameters
export interface AndroidBillingAddressParameters {
    format?: 'FULL' | 'MIN';
    phoneNumberRequired?: boolean;
}
