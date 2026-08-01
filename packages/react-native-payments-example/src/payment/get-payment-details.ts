import { demoCurrency } from '../constant/demo-currency';
import { shippingSurchargeValue } from '../constant/shipping-surcharge-value';

import type { RequestOptionsInterface } from '../interface/request-options.interface';
import type { PaymentDetailsInit } from '@rnw-community/react-native-payments';

export const getPaymentDetails = (options: RequestOptionsInterface): PaymentDetailsInit => ({
    total: {
        amount: { currency: demoCurrency, value: options.totalValue },
        label: 'Total',
    },
    ...(options.showDisplayItems && {
        displayItems: [{ amount: { currency: demoCurrency, value: options.totalValue }, label: 'Order' }],
    }),
    ...(options.requestShipping && {
        shippingOptions: [
            { amount: { currency: demoCurrency, value: '0.00' }, id: 'standard', label: 'Standard', selected: true },
            { amount: { currency: demoCurrency, value: shippingSurchargeValue }, id: 'express', label: 'Express' },
        ],
    }),
});
