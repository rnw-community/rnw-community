/**
 * The Google Pay `SignedMessage` shape.
 *
 * @see https://developers.google.com/pay/api/android/guides/resources/payment-data-cryptography#signed-message
 */
export interface AndroidSignedMessage {
    encryptedMessage: string;
    ephemeralPublicKey: string;
    tag: string;
}

export const emptyAndroidSignedMessage: AndroidSignedMessage = {
    encryptedMessage: '',
    ephemeralPublicKey: '',
    tag: '',
};
