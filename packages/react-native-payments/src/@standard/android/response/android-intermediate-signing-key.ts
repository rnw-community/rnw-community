import { emptyAndroidSignedKey } from './android-signed-key';

import type { AndroidSignedKey } from './android-signed-key';

// https://developers.google.com/pay/api/android/guides/resources/payment-data-cryptography#intermediate-signing-key
export interface AndroidIntermediateSigningKey {
    signatures: string;
    signedKey: AndroidSignedKey;
}

export const emptyAndroidIntermediateSigningKey: AndroidIntermediateSigningKey = {
    signatures: '',
    signedKey: emptyAndroidSignedKey,
};
