import type { AndroidIntermediateSigningKey } from './android-intermediate-signing-key';
import type { AndroidSignedMessage } from './android-signed-message';

export interface AndroidPaymentMethodToken {
    intermediateSigningKey: AndroidIntermediateSigningKey;
    protocolVersion: string;
    signature: string;
    signedMessage: AndroidSignedMessage;
}
