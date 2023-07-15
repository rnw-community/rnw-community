import { isDefined } from '@rnw-community/shared';

import type { PaymentShippingOption } from '../interface/payment-shipping-options';

export const getSelectedShippingOption = (shippingOptions: PaymentShippingOption[]): string => {
    if (!Array.isArray(shippingOptions)) {
        return '';
    }

    if (shippingOptions.length === 0) {
        return '';
    }

    const selectedShippingOption = shippingOptions.find(shippingOption => shippingOption.selected);

    // Return selectedShippingOption id
    if (isDefined(selectedShippingOption)) {
        return selectedShippingOption.id;
    }

    // Return first shippingOption if no shippingOption was marked as selected
    return shippingOptions[0].id;
};
