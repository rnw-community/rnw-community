import { NativeModules, Platform } from 'react-native';

import { isDefined } from '@rnw-community/shared';

import type { NativePaymentsChangeEventsInterface } from '../../interface/native-payments-change-events.interface';
import type { NativePaymentsRetryInterface } from '../../interface/native-payments-retry.interface';
import type { Spec } from '../../NativePayments';

const LINKING_ERROR = `The package 'react-native-payments' doesn't seem to be linked. Make sure: \n\n${Platform.select({
    ios: "- You have run 'pod install'\n",
    default: '',
})}- You rebuilt the app after installing the package\n- You are not using Expo Go\n`;

type NativePaymentsOptionalInterface = NativePaymentsChangeEventsInterface & NativePaymentsRetryInterface;

type NativePaymentsType = NativePaymentsOptionalInterface & Omit<Spec, keyof NativePaymentsOptionalInterface>;

const optionalNativeMethodNames = new Set<PropertyKey>([
    'addListener',
    'removeListeners',
    'retry',
    'setActiveEvents',
    'updatePaymentDetails',
]);

// @ts-expect-error global.__turboModuleProxy is untyped
// eslint-disable-next-line no-underscore-dangle
const isTurboModuleEnabled = isDefined(global.__turboModuleProxy);

const PaymentsModule = isTurboModuleEnabled
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports,n/no-missing-require,@typescript-eslint/no-unsafe-member-access
      (require('../../NativePayments').default as NativePaymentsType)
    : (NativeModules as { Payments: NativePaymentsType }).Payments;

const PaymentsProxy = new Proxy(
    {},
    {
        get(_target: object, propertyName: PropertyKey) {
            if (optionalNativeMethodNames.has(propertyName)) {
                return void 0;
            }

            throw new Error(LINKING_ERROR);
        },
    }
) as NativePaymentsType;

export const NativePayments: NativePaymentsType = isDefined(PaymentsModule) ? PaymentsModule : PaymentsProxy;
