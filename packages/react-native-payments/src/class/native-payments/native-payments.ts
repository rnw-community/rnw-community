import { NativeModules, Platform } from 'react-native';

import { isDefined } from '@rnw-community/shared';

import type { NativePaymentsChangeEventsInterface } from '../../interface/native-payments-change-events.interface';
import type { Spec } from '../../NativePayments';

const LINKING_ERROR = `The package 'react-native-payments' doesn't seem to be linked. Make sure: \n\n${Platform.select({
    ios: "- You have run 'pod install'\n",
    default: '',
})}- You rebuilt the app after installing the package\n- You are not using Expo Go\n`;

type NativePaymentsType = NativePaymentsChangeEventsInterface & Omit<Spec, keyof NativePaymentsChangeEventsInterface>;

const changeEventMethodNames = new Set<PropertyKey>([
    'addListener',
    'removeListeners',
    'setActiveEvents',
    'updatePaymentDetails',
]);

// @ts-expect-error Temporary hack
// eslint-disable-next-line no-underscore-dangle
const isTurboModuleEnabled = global.__turboModuleProxy !== null;

const PaymentsModule = isTurboModuleEnabled
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports,n/no-missing-require,@typescript-eslint/no-unsafe-member-access
      (require('../../NativePayments').default as NativePaymentsType)
    : (NativeModules as { Payments: NativePaymentsType }).Payments;

const PaymentsProxy = new Proxy(
    {},
    {
        get(_target: object, propertyName: PropertyKey) {
            if (changeEventMethodNames.has(propertyName)) {
                return void 0;
            }

            throw new Error(LINKING_ERROR);
        },
    }
) as NativePaymentsType;

export const NativePayments: NativePaymentsType = isDefined(PaymentsModule) ? PaymentsModule : PaymentsProxy;
