import { isDefined, isNotEmptyArray } from '@rnw-community/shared';

import { demoCurrency } from '../constant/demo-currency.js';
import { zeroAmountValue } from '../constant/zero-amount-value.js';

import { getShippingOptions } from './get-shipping-options.js';
import { getUpdatedTotalValue } from './get-updated-total-value.js';

import type { RequestOptionsInterface } from '../interface/request-options.interface.js';
import type { PaymentDetailsUpdate, PaymentItem, PaymentShippingOption } from '@rnw-community/react-native-payments';
import type { Maybe } from '@rnw-community/shared';

const getSelectedShippingValue = (shippingOptions: PaymentShippingOption[]): Maybe<string> =>
    shippingOptions.find(option => option.selected === true)?.amount.value ?? null;

const getDisplayItems = (totalValue: string, shippingValue: Maybe<string>): PaymentItem[] => [
    { amount: { currency: demoCurrency, value: totalValue }, label: 'Order' },
    ...(isDefined(shippingValue) ? [{ amount: { currency: demoCurrency, value: shippingValue }, label: 'Shipping' }] : []),
];

export const getDetailsUpdate = (
    options: RequestOptionsInterface,
    selectedShippingOption: Maybe<string>
): PaymentDetailsUpdate => {
    const shippingOptions = options.requestShipping ? getShippingOptions(selectedShippingOption) : [];
    const shippingValue = getSelectedShippingValue(shippingOptions);

    return {
        ...(options.showDisplayItems && { displayItems: getDisplayItems(options.totalValue, shippingValue) }),
        ...(isNotEmptyArray(shippingOptions) && { shippingOptions }),
        total: {
            amount: {
                currency: demoCurrency,
                value: getUpdatedTotalValue(options.totalValue, shippingValue ?? zeroAmountValue),
            },
            label: 'Total',
        },
    };
};
