// https://developers.google.com/pay/api/android/guides/resources/payment-data-cryptography#intermediate-signing-key
export interface AndroidIntermediateSigningKey {
    signatures: string;
    // AndroidSignedKey is a stringified JSON object
    signedKey: string;
}
