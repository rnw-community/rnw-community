import { useCallback, useEffect, useRef, useState } from 'react';

import { isDefined } from '@rnw-community/shared';

import { defaultRequestOptions } from '../constant/default-request-options';
import { abortPaymentRequest } from '../payment/abort-payment-request';
import { checkCanMakePayment } from '../payment/check-can-make-payment';
import { createDemoRequest } from '../payment/create-demo-request';
import { showPaymentRequest } from '../payment/show-payment-request';
import { formatLogMessage } from '../util/format-log-message';

import type { PaymentDemoInterface } from '../interface/payment-demo.interface';
import type { RequestOptionsInterface } from '../interface/request-options.interface';
import type { PaymentRequest } from '@rnw-community/react-native-payments';
import type { Maybe, OnEventFn } from '@rnw-community/shared';

export const usePaymentDemo = (options: RequestOptionsInterface, log: OnEventFn<string>): PaymentDemoInterface => {
    const [canMakePaymentStatus, setCanMakePaymentStatus] = useState('checking');
    const [flowState, setFlowState] = useState('idle');
    const requestRef = useRef<Maybe<PaymentRequest>>(null);

    useEffect(() => {
        void checkCanMakePayment(defaultRequestOptions, log, setCanMakePaymentStatus);
    }, [log]);

    const showRequest = useCallback((): void => {
        const request = requestRef.current ?? createDemoRequest(options, log);

        requestRef.current = request;

        if (!isDefined(request)) {
            setFlowState('request-failed');

            return;
        }

        setFlowState('showing');
        void showPaymentRequest(request, log, setFlowState);
    }, [log, options]);

    const abortRequest = useCallback((): void => {
        const request = requestRef.current;

        if (!isDefined(request)) {
            log(formatLogMessage('abort skipped', { reason: 'no request' }));

            return;
        }

        void abortPaymentRequest(request, log);
    }, [log]);

    const resetRequest = useCallback((): void => {
        requestRef.current = null;
        setFlowState('idle');
        log(formatLogMessage('request reset'));
    }, [log]);

    return { abortRequest, canMakePaymentStatus, flowState, resetRequest, showRequest };
};
