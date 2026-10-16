/**
 * The discriminator of a field-level `PaymentDetailsUpdateError` answered from `updateWith()`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/payment-update-error-type-enum.md
 */
export enum PaymentUpdateErrorTypeEnum {
    ContactField = 'contactField',
    CouponCode = 'couponCode',
    ShippingAddressField = 'shippingAddressField',
}
