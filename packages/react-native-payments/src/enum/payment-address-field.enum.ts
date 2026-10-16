/**
 * The address field keys a field-level sheet error or `retry()` error can point at.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/payment-address-contact-field-enums.md
 * @see https://www.w3.org/TR/payment-request/#dom-addresserrors
 */
export enum PaymentAddressFieldEnum {
    AddressLine = 'addressLine',
    City = 'city',
    Country = 'country',
    DependentLocality = 'dependentLocality',
    PostalCode = 'postalCode',
    Region = 'region',
    SubAdministrativeArea = 'subAdministrativeArea',
}
