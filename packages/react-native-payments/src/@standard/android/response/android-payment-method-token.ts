import { type AndroidCardInfo, emptyAndroidCardInfo } from './android-card-info.js';
import { emptyAndroidIntermediateSigningKey } from './android-intermediate-signing-key.js';
import { emptyAndroidSignedMessage } from './android-signed-message.js';

import type { AndroidIntermediateSigningKey } from './android-intermediate-signing-key.js';
import type { AndroidSignedMessage } from './android-signed-message.js';

export interface AndroidPaymentMethodToken {
    cardInfo: AndroidCardInfo;
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
    cardInfo: emptyAndroidCardInfo,
};
