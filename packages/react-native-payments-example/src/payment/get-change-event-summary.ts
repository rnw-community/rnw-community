import { PaymentMethodChangeEvent } from '@rnw-community/react-native-payments';

import type { PaymentRequest, PaymentRequestUpdateEvent } from '@rnw-community/react-native-payments';

const missingValue = 'none';

export const getChangeEventSummary = (event: PaymentRequestUpdateEvent, request: PaymentRequest): Record<string, string> => {
    if (event.type === 'paymentmethodchange') {
        return { method: event instanceof PaymentMethodChangeEvent ? event.methodName : missingValue };
    }

    if (event.type === 'shippingaddresschange') {
        return {
            city: request.shippingAddress?.locality ?? missingValue,
            country: request.shippingAddress?.countryCode ?? missingValue,
        };
    }

    if (event.type === 'shippingoptionchange') {
        return { option: request.shippingOption ?? missingValue };
    }

    return { coupon: request.couponCode ?? missingValue };
};
