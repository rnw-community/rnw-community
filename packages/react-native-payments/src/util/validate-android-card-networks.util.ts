import { isEmptyArray } from '@rnw-community/shared';

import { PaymentMethodNameEnum } from '../enum/payment-method-name.enum';

import { getAndroidCardNetworks } from './get-android-card-networks/get-android-card-networks.util';

import type { PaymentMethodData } from '../@standard/w3c/payment-method-data';
import type { ClassType } from '@rnw-community/shared';

export const validateAndroidCardNetworks = (methodData: PaymentMethodData[], ErrorType: ClassType<Error>): void => {
    const hasNoGooglePayNetwork = methodData.some(
        paymentMethodData =>
            paymentMethodData.supportedMethods === PaymentMethodNameEnum.AndroidPay &&
            isEmptyArray(getAndroidCardNetworks(paymentMethodData.data.supportedNetworks))
    );

    if (hasNoGooglePayNetwork) {
        throw new ErrorType('supportedNetworks contains no card network that Google Pay accepts');
    }
};
