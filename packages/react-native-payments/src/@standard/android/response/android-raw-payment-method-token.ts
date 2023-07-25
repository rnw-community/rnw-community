import type { AndroidIntermediateSigningKey } from './android-intermediate-signing-key';

// https://developers.google.com/pay/api/android/guides/resources/payment-data-cryptography#payment-method-token-structure
export interface AndroidRawPaymentMethodToken {
    intermediateSigningKey: AndroidIntermediateSigningKey;
    protocolVersion: string;
    signature: string;
    // AndroidSignedMessage is a stringified JSON objectAndroidSignedMessage
    signedMessage: string;
}
