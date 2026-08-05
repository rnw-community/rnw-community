import { defaultShippingOptionId } from './default-shipping-option-id.js';
import { demoCurrency } from './demo-currency.js';
import { shippingSurchargeValue } from './shipping-surcharge-value.js';
import { zeroAmountValue } from './zero-amount-value.js';

import type { PaymentShippingOption } from '@rnw-community/react-native-payments';

export const demoShippingOptions: PaymentShippingOption[] = [
    { amount: { currency: demoCurrency, value: zeroAmountValue }, id: defaultShippingOptionId, label: 'Standard' },
    { amount: { currency: demoCurrency, value: shippingSurchargeValue }, id: 'express', label: 'Express' },
];
