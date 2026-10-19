/**
 * The normalized billing or shipping address returned on a payment response and during a shipping address change.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/payment-response-address.md
 */
export interface PaymentResponseAddressInterface {
    address1: string;
    address2: string;
    address3: string;
    administrativeArea: string;
    countryCode: string;
    locality: string;
    postalCode: string;
    sortingCode: string;
}
