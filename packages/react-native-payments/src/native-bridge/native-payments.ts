import { NativeModules, Platform } from 'react-native';

import { isDefined } from '@rnw-community/shared';

import { abortPayment } from './abort-payment';
import { canMakePayments } from './can-make-payment';
import { createPaymentRequest } from './create-payment-request';
import { finishPayment } from './finish-payment';
import { handleDetailsUpdate } from './handle-details-update';
import { startPayment } from './start-payment';

import type { Spec } from '../NativePayments';

const LINKING_ERROR = `The package 'react-native-payments' doesn't seem to be linked. Make sure: \n\n${Platform.select({
    ios: "- You have run 'pod install'\n",
    default: '',
})}- You rebuilt the app after installing the package\n- You are not using Expo Go\n`;

// @ts-expect-error Temporary hack
// eslint-disable-next-line no-underscore-dangle
const isTurboModuleEnabled = global.__turboModuleProxy !== null;

// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-var-requires,node/no-missing-require
const PaymentsModule = (isTurboModuleEnabled ? require('../NativePayments').default : NativeModules['Payments']) as Spec;
const PaymentsProxy = new Proxy(
    {},
    {
        get() {
            throw new Error(LINKING_ERROR);
        },
    }
) as Spec;

const nativePayments = isDefined(PaymentsModule) ? PaymentsModule : PaymentsProxy;

// TODO: This object could be eliminated and all logic should be called in used classes?
export const NativePayments = {
    canMakePayments: canMakePayments(nativePayments),
    // TODO: Do we need it the API as android is not doing anything?
    createPaymentRequest: createPaymentRequest(nativePayments),
    handleDetailsUpdate: handleDetailsUpdate(nativePayments),
    show: startPayment(nativePayments),
    abort: abortPayment(nativePayments),
    complete: finishPayment(nativePayments),
};
