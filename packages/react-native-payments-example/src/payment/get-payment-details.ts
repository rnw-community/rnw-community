import { demoCurrency } from '../constant/demo-currency.js';

import { getShippingOptions } from './get-shipping-options.js';

import type { RequestOptionsInterface } from '../interface/request-options.interface.js';
import type { PaymentDetailsInit } from '@rnw-community/react-native-payments';

export const getPaymentDetails = (options: RequestOptionsInterface): PaymentDetailsInit => ({
    total: {
        amount: { currency: demoCurrency, value: options.totalValue },
        label: 'Total',
    },
    ...(options.showDisplayItems && {
        displayItems: [{ amount: { currency: demoCurrency, value: options.totalValue }, label: 'Order' }],
    }),
    ...(options.requestShipping && { shippingOptions: getShippingOptions(null) }),
});
