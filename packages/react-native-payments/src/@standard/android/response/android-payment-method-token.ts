import { emptyAndroidIntermediateSigningKey } from './android-intermediate-signing-key';
import { emptyAndroidSignedMessage } from './android-signed-message';

import type { AndroidIntermediateSigningKey } from './android-intermediate-signing-key';
import type { AndroidSignedMessage } from './android-signed-message';

export interface AndroidPaymentMethodToken {
    intermediateSigningKey: AndroidIntermediateSigningKey;
    protocolVersion: string;
    rawToken: string;
    signature: string;
    signedMessage: AndroidSignedMessage;
}

export const emptyAndroidPaymentMethodToken: AndroidPaymentMethodToken = {
    intermediateSigningKey: emptyAndroidIntermediateSigningKey,
    protocolVersion: '',
    signature: '',
    signedMessage: emptyAndroidSignedMessage,
    rawToken: '',
};
