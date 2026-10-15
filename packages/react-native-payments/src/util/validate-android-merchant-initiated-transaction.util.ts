import { isDefined, isNotEmptyString } from '@rnw-community/shared';

import { PaymentMethodNameEnum } from '../enum/payment-method-name.enum';

import type { AndroidPaymentMethodDataDataInterface } from '../@standard/android/mapping/android-payment-method-data-data.interface';
import type { PaymentMethodData } from '../@standard/w3c/payment-method-data';
import type { ClassType } from '@rnw-community/shared';

const merchantInitiatedTransactionKeys = [
    'deferredTransactionInfo',
    'recurringTransactionInfo',
    'automaticReloadTransactionInfo',
] as const;

const validateMethodData = (data: AndroidPaymentMethodDataDataInterface, ErrorType: ClassType<Error>): void => {
    const providedKeys = merchantInitiatedTransactionKeys.filter(key => isDefined(data[key]));
    const [providedKey] = providedKeys;

    if (!isDefined(providedKey)) {
        return;
    }

    if (providedKeys.length > 1) {
        throw new ErrorType(`Only one of ${merchantInitiatedTransactionKeys.join(', ')} can be provided`);
    }

    if (!isNotEmptyString(data.countryCode)) {
        throw new ErrorType(`${providedKey} requires countryCode`);
    }

    if (isDefined(data.checkoutOption) || isDefined(data.totalPriceStatus)) {
        throw new ErrorType(`${providedKey} cannot be combined with checkoutOption or totalPriceStatus`);
    }
};

export const validateAndroidMerchantInitiatedTransaction = (
    methodData: PaymentMethodData[],
    ErrorType: ClassType<Error>
): void => {
    methodData.forEach(paymentMethodData => {
        if (paymentMethodData.supportedMethods === PaymentMethodNameEnum.AndroidPay) {
            validateMethodData(paymentMethodData.data, ErrorType);
        }
    });
};
