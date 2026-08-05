import { useCallback, useEffect, useRef, useState } from 'react';

import { isDefined } from '@rnw-community/shared';

import { defaultRequestOptions } from '../constant/default-request-options.js';
import { abortPaymentRequest } from '../payment/abort-payment-request.js';
import { checkCanMakePayment } from '../payment/check-can-make-payment.js';
import { createDemoRequest } from '../payment/create-demo-request.js';
import { showPaymentRequest } from '../payment/show-payment-request.js';
import { createFlowStateGuard } from '../util/create-flow-state-guard.js';
import { formatLogMessage } from '../util/format-log-message.js';

import type { PaymentDemoInterface } from '../interface/payment-demo.interface.js';
import type { RequestOptionsInterface } from '../interface/request-options.interface.js';
import type { PaymentRequest } from '@rnw-community/react-native-payments';
import type { Maybe, OnEventFn } from '@rnw-community/shared';

export const usePaymentDemo = (options: RequestOptionsInterface, log: OnEventFn<string>): PaymentDemoInterface => {
    const [canMakePaymentStatus, setCanMakePaymentStatus] = useState('checking');
    const [flowState, setFlowState] = useState('idle');
    const requestRef = useRef<Maybe<PaymentRequest>>(null);
    const requestGenerationRef = useRef(0);

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

        const generation = requestGenerationRef.current;
        const isCurrentRequest = (): boolean => requestGenerationRef.current === generation;

        setFlowState('showing');
        void showPaymentRequest(request, log, createFlowStateGuard(isCurrentRequest, setFlowState, log));
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
        requestGenerationRef.current += 1;
        requestRef.current = null;
        setFlowState('idle');
        log(formatLogMessage('request reset'));
    }, [log]);

    return { abortRequest, canMakePaymentStatus, flowState, resetRequest, showRequest };
};
