import { isDefined } from '@rnw-community/shared';

import type { PaymentDetailsModifier } from '../@standard/w3c/payment-details-modifier.js';
import type { PaymentItem } from '../@standard/w3c/payment-item.js';
import type { PaymentMethodNameEnum } from '../enum/payment-method-name.enum.js';
import type { ResolvedPaymentDetailsInterface } from '../interface/resolved-payment-details.interface.js';

// https://www.w3.org/TR/payment-request/#dom-paymentdetailsmodifier
export const resolvePaymentDetailsModifier = (
    platformSupportedMethod: PaymentMethodNameEnum,
    total: PaymentItem,
    displayItems: PaymentItem[] = [],
    modifiers: PaymentDetailsModifier[] = []
): ResolvedPaymentDetailsInterface => {
    const modifier = modifiers.find(candidate => candidate.supportedMethods === platformSupportedMethod);

    if (!isDefined(modifier)) {
        return { displayItems, total };
    }

    return {
        displayItems: [...displayItems, ...(modifier.additionalDisplayItems ?? [])],
        total: modifier.total ?? total,
    };
};
