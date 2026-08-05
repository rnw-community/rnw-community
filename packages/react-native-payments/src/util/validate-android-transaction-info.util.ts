import { defaultAndroidTransactionInfo } from '../@standard/android/request/android-transaction-info.js';
import { PaymentMethodNameEnum } from '../enum/payment-method-name.enum.js';

import type { PaymentMethodData } from '../@standard/w3c/payment-method-data.js';
import type { ClassType } from '@rnw-community/shared';

export const validateAndroidTransactionInfo = (methodData: PaymentMethodData[], ErrorType: ClassType<Error>): void => {
    const hasInvalidCheckoutOption = methodData.some(
        paymentMethodData =>
            paymentMethodData.supportedMethods === PaymentMethodNameEnum.AndroidPay &&
            paymentMethodData.data.checkoutOption === 'COMPLETE_IMMEDIATE_PURCHASE' &&
            (paymentMethodData.data.totalPriceStatus ?? defaultAndroidTransactionInfo.totalPriceStatus) !== 'FINAL'
    );

    if (hasInvalidCheckoutOption) {
        throw new ErrorType(`checkoutOption 'COMPLETE_IMMEDIATE_PURCHASE' requires totalPriceStatus 'FINAL'`);
    }
};
