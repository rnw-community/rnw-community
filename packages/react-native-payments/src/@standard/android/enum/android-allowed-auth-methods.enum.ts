/**
 * The Google Pay card authentication methods a merchant accepts, set on `allowedAuthMethods` of the Android `methodData` entry.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/android-allowed-auth-methods-enum.md
 * @see https://developers.google.com/pay/api/android/reference/request-objects#CardParameters
 */
export enum AndroidAllowedAuthMethodsEnum {
    CRYPTOGRAM_3DS = 'CRYPTOGRAM_3DS',
    PAN_ONLY = 'PAN_ONLY',
}
