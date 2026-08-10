import { defaultShippingOptionId } from '../constant/default-shipping-option-id';
import { demoShippingOptions } from '../constant/demo-shipping-options';

import type { PaymentShippingOption } from '@rnw-community/react-native-payments';
import type { Maybe } from '@rnw-community/shared';

export const getShippingOptions = (selectedShippingOption: Maybe<string>): PaymentShippingOption[] => {
    const isKnownOption = demoShippingOptions.some(option => option.id === selectedShippingOption);
    const selectedId = isKnownOption ? selectedShippingOption : defaultShippingOptionId;

    return demoShippingOptions.map(option => ({ ...option, selected: option.id === selectedId }));
};
