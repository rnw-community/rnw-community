import { NativeModules, Platform } from 'react-native';

import { isDefined } from '@rnw-community/shared';

import type { Spec } from '../../NativePayments';

const LINKING_ERROR = `The package 'react-native-payments' doesn't seem to be linked. Make sure: \n\n${Platform.select({
    ios: "- You have run 'pod install'\n",
    default: '',
})}- You rebuilt the app after installing the package\n- You are not using Expo Go\n`;

// @ts-expect-error Temporary hack
// eslint-disable-next-line no-underscore-dangle
const isTurboModuleEnabled = global.__turboModuleProxy !== null;

 
const PaymentsModule = isTurboModuleEnabled
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports,n/no-missing-require,@typescript-eslint/no-unsafe-member-access
      (require('../../NativePayments').default as Spec)
    : (NativeModules as { Payments: Spec }).Payments;

const PaymentsProxy = new Proxy(
    {},
    {
         
        get() {
            throw new Error(LINKING_ERROR);
        },
    }
) as Spec;

 
export const NativePayments = isDefined(PaymentsModule) ? PaymentsModule : PaymentsProxy;
