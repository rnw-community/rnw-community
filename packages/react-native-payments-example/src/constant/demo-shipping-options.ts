import { defaultShippingOptionId } from './default-shipping-option-id';
import { demoCurrency } from './demo-currency';
import { shippingSurchargeValue } from './shipping-surcharge-value';
import { zeroAmountValue } from './zero-amount-value';

import type { PaymentShippingOption } from '@rnw-community/react-native-payments';

export const demoShippingOptions: PaymentShippingOption[] = [
    { amount: { currency: demoCurrency, value: zeroAmountValue }, id: defaultShippingOptionId, label: 'Standard' },
    { amount: { currency: demoCurrency, value: shippingSurchargeValue }, id: 'express', label: 'Express' },
];
