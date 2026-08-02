import { isDefined } from '@rnw-community/shared';

import { PaymentsError } from '../error/payments.error';

import { validateDisplayItems } from './validate-display-items.util';
import { validateShippingOptions } from './validate-shipping-options.util';
import { validateTotal } from './validate-total.util';

import type { PaymentDetailsUpdate } from '../@standard/w3c/payment-details-update';

export const validateDetailsUpdate = (detailsUpdate: PaymentDetailsUpdate): void => {
    if (isDefined(detailsUpdate.total)) {
        validateTotal(detailsUpdate.total, PaymentsError);
    }

    validateDisplayItems(detailsUpdate.displayItems, PaymentsError);
    validateShippingOptions(detailsUpdate.shippingOptions, PaymentsError);
};
