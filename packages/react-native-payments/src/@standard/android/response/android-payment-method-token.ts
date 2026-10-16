import { type AndroidCardInfo, emptyAndroidCardInfo } from './android-card-info';
import { emptyAndroidIntermediateSigningKey } from './android-intermediate-signing-key';
import { emptyAndroidSignedMessage } from './android-signed-message';

import type { AndroidIntermediateSigningKey } from './android-intermediate-signing-key';
import type { AndroidSignedMessage } from './android-signed-message';

/**
 * The parsed Google Pay payment token exposed as `details.androidPayToken` on an `AndroidPaymentResponse`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/android-payment-method-token.md
 * @see https://developers.google.com/pay/api/android/guides/resources/payment-data-cryptography#payment-method-token-structure
 */
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
