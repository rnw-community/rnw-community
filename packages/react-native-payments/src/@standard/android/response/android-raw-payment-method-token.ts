import type { AndroidRawIntermediateSigningKey } from './android-raw-intermediate-signing-key';

// https://developers.google.com/pay/api/android/guides/resources/payment-data-cryptography#payment-method-token-structure
export interface AndroidRawPaymentMethodToken {
    intermediateSigningKey: AndroidRawIntermediateSigningKey;
    protocolVersion: string;
    signature: string;
    signedMessage: string;
}
