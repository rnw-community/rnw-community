import React, { useState } from 'react';
import { Button } from 'react-native';

import { PaymentComplete, type PaymentResponse } from '@rnw-community/react-native-payments';
import { getErrorMessage } from '@rnw-community/shared';

import { createPaymentRequest } from '../payment/create-payment-request';
import { getAndroidPaymentMethodData } from '../payment/method-data/android-payment-method-data';
import { getIosPaymentMethodData } from '../payment/method-data/ios-payment-method-data';
import { paymentDetails as defaultPaymentDetails, paymentDetailsWithoutDisplayItems } from '../payment/payment-details';

import { SwitchRow } from './switch-row';

interface RequestOptionsFormProps {
    readonly setError: (error: string) => void;
    readonly setResponse: (response: PaymentResponse['details'] | undefined) => void;
}

export const RequestOptionsForm = ({ setResponse, setError }: RequestOptionsFormProps): React.ReactNode => {
    const [requestBillingAddress, setRequestBillingAddress] = useState(false);
    const [requestPayerEmail, setRequestPayerEmail] = useState(false);
    const [requestPayerName, setRequestPayerName] = useState(false);
    const [requestPayerPhone, setRequestPayerPhone] = useState(false);
    const [requestShipping, setRequestShipping] = useState(false);
    const [showDisplayItems, setShowDisplayItems] = useState(false);

    const clearErrorAndResponse = (): void => {
        setError('');
        setResponse(undefined);
    };

    const handleSubmit = (): void => {
        clearErrorAndResponse();
        createPaymentRequest({
            iosPaymentMethodData: getIosPaymentMethodData({
                requestBillingAddress,
                requestPayerEmail,
                requestPayerName,
                requestPayerPhone,
                requestShipping,
            }),
            androidPaymentMethodData: getAndroidPaymentMethodData({
                requestBillingAddress,
                requestPayerEmail,
                requestPayerName,
                requestPayerPhone,
                requestShipping,
            }),
            paymentDetails: showDisplayItems ? defaultPaymentDetails : paymentDetailsWithoutDisplayItems,
        })
            .show()
            .then(paymentResponse => {
                setResponse(paymentResponse.details);

                return paymentResponse.complete(PaymentComplete.SUCCESS);
            })
            .catch((err: unknown) => void setError(getErrorMessage(err)));
    };

    return (
        <>
            <Button
                onPress={handleSubmit}
                title="ApplePay/GooglePay with following options:"
            />

            <SwitchRow
                setValue={setRequestBillingAddress}
                text="requestBillingAddress"
                value={requestBillingAddress}
            />

            <SwitchRow
                setValue={setRequestPayerEmail}
                text="requestPayerEmail"
                value={requestPayerEmail}
            />

            <SwitchRow
                setValue={setRequestPayerName}
                text="requestPayerName"
                value={requestPayerName}
            />

            <SwitchRow
                setValue={setRequestPayerPhone}
                text="requestPayerPhone"
                value={requestPayerPhone}
            />

            <SwitchRow
                setValue={setRequestShipping}
                text="requestShipping"
                value={requestShipping}
            />

            <SwitchRow
                setValue={setShowDisplayItems}
                text="showDisplayItems"
                value={showDisplayItems}
            />
        </>
    );
};
