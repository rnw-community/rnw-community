import { isDefined } from '@rnw-community/shared';

import { PaymentsError } from '../error/payments.error.js';

import { validateDisplayItems } from './validate-display-items.util.js';
import { validateModifiers } from './validate-modifiers.util.js';
import { validateShippingOptions } from './validate-shipping-options.util.js';
import { validateTotal } from './validate-total.util.js';

import type { PaymentDetailsUpdate } from '../@standard/w3c/payment-details-update.js';

export const validateDetailsUpdate = (detailsUpdate: PaymentDetailsUpdate): void => {
    if (isDefined(detailsUpdate.total)) {
        validateTotal(detailsUpdate.total, PaymentsError);
    }

    validateDisplayItems(PaymentsError, detailsUpdate.displayItems);
    validateShippingOptions(PaymentsError, detailsUpdate.shippingOptions);
    validateModifiers(PaymentsError, detailsUpdate.modifiers);
};
