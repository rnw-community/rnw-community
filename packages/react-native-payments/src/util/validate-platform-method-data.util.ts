import { isIOS } from '@rnw-community/platform';
import { isDefined } from '@rnw-community/shared';

import { PaymentMethodNameEnum } from '../enum/payment-method-name.enum';
import { PaymentsErrorEnum } from '../enum/payments-error.enum';
import { DOMException } from '../error/dom.exception';

import type { PaymentMethodData } from '../interface/payment-method-data/payment-method-data';

export const validatePlatformMethodData = (methodData: PaymentMethodData[]): string => {
    const platformSupportedMethod = isIOS ? PaymentMethodNameEnum.ApplePay : PaymentMethodNameEnum.AndroidPay;
    const platformMethod = methodData.find(paymentMethodData =>
        paymentMethodData.supportedMethods.includes(platformSupportedMethod)
    );

    if (!isDefined(platformMethod)) {
        throw new DOMException(PaymentsErrorEnum.NotSupportedError);
    }

    return JSON.stringify(platformMethod.data);
};
