import { isDefined, isNotEmptyArray } from '@rnw-community/shared';

import { getAndroidDisplayItem } from '../get-android-display-item.util';
import { getAndroidShippingOptionParameters } from '../get-android-shipping-option-parameters.util';

import type { AndroidCallbackIntent } from '../../@standard/android/request/android-callback-intent';
import type { AndroidPaymentDataRequest } from '../../@standard/android/request/android-payment-data-request';
import type { AndroidShippingOptionParameters } from '../../@standard/android/request/android-shipping-option-parameters';
import type { PaymentItem } from '../../@standard/w3c/payment-item';
import type { PaymentShippingOption } from '../../@standard/w3c/payment-shipping-option';
import type { PaymentRequestEventType } from '../../type/payment-request-event.type';
import type { Maybe } from '@rnw-community/shared';

const getShippingOptionParameters = (
    eventNames: PaymentRequestEventType[],
    shippingOptions: PaymentShippingOption[]
): Maybe<AndroidShippingOptionParameters> =>
    eventNames.includes('shippingoptionchange') && isNotEmptyArray(shippingOptions)
        ? getAndroidShippingOptionParameters(shippingOptions)
        : null;

export const getAndroidCallbackPaymentDataRequest = (
    request: AndroidPaymentDataRequest,
    eventNames: PaymentRequestEventType[],
    displayItems: PaymentItem[],
    shippingOptions: PaymentShippingOption[]
): AndroidPaymentDataRequest => {
    if (request.shippingAddressRequired !== true) {
        return request;
    }

    const hasAddressCallback = eventNames.includes('shippingaddresschange');
    const shippingOptionParameters = getShippingOptionParameters(eventNames, shippingOptions);

    if (!hasAddressCallback && !isDefined(shippingOptionParameters)) {
        return request;
    }

    const callbackIntents: AndroidCallbackIntent[] = [
        'PAYMENT_AUTHORIZATION',
        ...(hasAddressCallback ? (['SHIPPING_ADDRESS'] as const) : []),
        ...(isDefined(shippingOptionParameters) ? (['SHIPPING_OPTION'] as const) : []),
    ];

    return {
        ...request,
        callbackIntents,
        transactionInfo: {
            ...request.transactionInfo,
            ...(isNotEmptyArray(displayItems) && { displayItems: displayItems.map(getAndroidDisplayItem) }),
        },
        ...(isDefined(shippingOptionParameters) && { shippingOptionParameters, shippingOptionRequired: true }),
    };
};
