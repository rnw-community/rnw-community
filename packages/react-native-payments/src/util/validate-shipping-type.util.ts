import { isDefined } from '@rnw-community/shared';

import { PaymentShippingTypeEnum } from '../enum/payment-shipping-type.enum';

import type { PaymentMethodData } from '../@standard/w3c/payment-method-data';
import type { ClassType } from '@rnw-community/shared';

const validShippingTypes: readonly string[] = Object.values(PaymentShippingTypeEnum);

// https://www.w3.org/TR/payment-request/#dom-paymentoptions-shippingtype
export const validateShippingType = (methodData: PaymentMethodData[], ErrorType: ClassType<Error>): void => {
    methodData.forEach(paymentMethodData => {
        const { shippingType } = paymentMethodData.data;

        if (isDefined(shippingType) && !validShippingTypes.includes(shippingType)) {
            throw new ErrorType(`'${shippingType}' is not a valid shippingType`);
        }
    });
};
