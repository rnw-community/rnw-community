import { isNotEmptyString } from '@rnw-community/shared';

import type { AndroidShippingOptionParameters } from '../@standard/android/request/android-shipping-option-parameters';
import type { PaymentShippingOption } from '../@standard/w3c/payment-shipping-option';
import type { ReadonlyIsNotEmptyArray } from '@rnw-community/shared';

export const getAndroidShippingOptionParameters = (
    shippingOptions: ReadonlyIsNotEmptyArray<PaymentShippingOption>
): AndroidShippingOptionParameters => {
    const selectedOptions = shippingOptions.filter(option => option.selected === true);
    const defaultSelectedOption = selectedOptions.pop() ?? shippingOptions[0];

    return {
        defaultSelectedOptionId: defaultSelectedOption.id,
        shippingOptions: shippingOptions.map(option => ({
            id: option.id,
            label: option.label,
            ...(isNotEmptyString(option.detail) && { description: option.detail }),
        })),
    };
};
