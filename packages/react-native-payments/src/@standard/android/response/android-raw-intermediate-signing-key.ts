/**
 * The Google Pay `IntermediateSigningKey` raw (un-parsed) shape.
 *
 * @see https://developers.google.com/pay/api/android/guides/resources/payment-data-cryptography#intermediate-signing-key
 */
export interface AndroidRawIntermediateSigningKey {
    signatures: string;
    signedKey: string;
}
