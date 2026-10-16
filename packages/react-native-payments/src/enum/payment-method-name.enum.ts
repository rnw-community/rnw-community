/**
 * The `supportedMethods` identifiers that pick the platform a `methodData` entry targets.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/payment-method-name-enum.md
 * @see https://www.w3.org/TR/payment-request/#dom-paymentmethoddata-supportedmethods
 */
export enum PaymentMethodNameEnum {
    AndroidPay = 'android-pay',
    ApplePay = 'apple-pay',
}
