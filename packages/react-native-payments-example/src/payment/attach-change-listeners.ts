import { Platform } from 'react-native';

import { formatLogMessage } from '../util/format-log-message.js';

import { createChangeEventListener } from './create-change-event-listener.js';

import type { RequestOptionsInterface } from '../interface/request-options.interface.js';
import type { PaymentRequest, PaymentRequestEventType } from '@rnw-community/react-native-payments';
import type { OnEventFn } from '@rnw-community/shared';

const getEnabledEventTypes = (options: RequestOptionsInterface): PaymentRequestEventType[] => {
    const eventTypes: PaymentRequestEventType[] = ['paymentmethodchange'];

    if (options.requestShipping) {
        eventTypes.push('shippingaddresschange', 'shippingoptionchange');
    }

    if (options.coupon && Platform.OS === 'ios') {
        eventTypes.push('couponcodechange');
    }

    return eventTypes;
};

export const attachChangeListeners = (
    request: PaymentRequest,
    options: RequestOptionsInterface,
    log: OnEventFn<string>
): void => {
    const listener = createChangeEventListener(request, options, log);
    const eventTypes = getEnabledEventTypes(options);

    eventTypes.forEach(eventType => {
        request.addEventListener(eventType, listener);
    });

    log(formatLogMessage('listeners attached', { types: eventTypes.join(',') }));

    if (Platform.OS === 'android') {
        log(formatLogMessage('platform note', { changeEvents: 'no-op', platform: 'android' }));
    }
};
