/**
 * The contact field keys a field-level sheet error or `retry()` error can point at.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/payment-address-contact-field-enums.md
 * @see https://developer.apple.com/documentation/passkit_apple_pay_and_wallet/pkcontactfield?language=objc
 */
export enum PaymentContactFieldEnum {
    Email = 'email',
    Name = 'name',
    Phone = 'phone',
    PostalAddress = 'postalAddress',
}
