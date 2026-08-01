import { demoCurrency } from '../constant/demo-currency';
import { shippingSurchargeValue } from '../constant/shipping-surcharge-value';

import { getUpdatedTotalValue } from './get-updated-total-value';

import type { RequestOptionsInterface } from '../interface/request-options.interface';
import type { PaymentDetailsUpdate } from '@rnw-community/react-native-payments';

export const getDetailsUpdate = (options: RequestOptionsInterface): PaymentDetailsUpdate => ({
    displayItems: [
        { amount: { currency: demoCurrency, value: options.totalValue }, label: 'Order' },
        { amount: { currency: demoCurrency, value: shippingSurchargeValue }, label: 'Express shipping' },
    ],
    shippingOptions: [
        {
            amount: { currency: demoCurrency, value: shippingSurchargeValue },
            id: 'express',
            label: 'Express',
            selected: true,
        },
    ],
    total: {
        amount: { currency: demoCurrency, value: getUpdatedTotalValue(options.totalValue) },
        label: 'Total',
    },
});
