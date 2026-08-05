import { isDefined } from '@rnw-community/shared';

import { validateDisplayItems } from './validate-display-items.util.js';
import { validateTotal } from './validate-total.util.js';

import type { PaymentDetailsModifier } from '../@standard/w3c/payment-details-modifier.js';
import type { ClassType } from '@rnw-community/shared';

export const validateModifiers = (ErrorType: ClassType<Error>, modifiers: PaymentDetailsModifier[] = []): void => {
    modifiers.forEach(modifier => {
        if (!isDefined(modifier) || !isDefined(modifier.supportedMethods)) {
            throw new ErrorType(`required member supportedMethods is undefined.`);
        }

        if (isDefined(modifier.total)) {
            validateTotal(modifier.total, ErrorType);
        }

        validateDisplayItems(ErrorType, modifier.additionalDisplayItems);
    });
};
