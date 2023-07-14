import { isDefined } from '@rnw-community/shared';

import { ConstructorError } from '../error/constructor.error';

import type { PaymentMethodData } from '../interface/payment-method-data/payment-method-data';

export const validatePaymentMethods = (methodData: PaymentMethodData[]): Array<[string[], string | null]> => {
    // Check that at least one payment method is passed in
    if (methodData.length < 1) {
        throw new ConstructorError(`At least one payment method is required`);
    }

    const serializedMethodData: Array<[string[], string | null]> = [];
    // Check that each payment method has at least one payment method identifier
    methodData.forEach(paymentMethod => {
        if (!isDefined(paymentMethod.supportedMethods)) {
            throw new ConstructorError(`required member supportedMethods is undefined.`);
        }

        if (!Array.isArray(paymentMethod.supportedMethods)) {
            throw new ConstructorError(`required member supportedMethods is not iterable.`);
        }

        if (paymentMethod.supportedMethods.length < 1) {
            throw new ConstructorError(`Each payment method needs to include at least one payment method identifier`);
        }

        const serializedData = isDefined(paymentMethod.data) ? JSON.stringify(paymentMethod.data) : null;

        serializedMethodData.push([paymentMethod.supportedMethods, serializedData]);
    });

    return serializedMethodData;
};
