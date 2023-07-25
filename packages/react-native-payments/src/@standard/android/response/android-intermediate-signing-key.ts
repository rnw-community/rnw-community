import type { AndroidSignedKey } from './android-signed-key';

// https://developers.google.com/pay/api/android/guides/resources/payment-data-cryptography#intermediate-signing-key
export interface AndroidIntermediateSigningKey {
    signatures: string;
    signedKey: AndroidSignedKey;
}
