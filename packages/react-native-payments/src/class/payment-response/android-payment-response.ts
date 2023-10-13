import { isDefined } from '@rnw-community/shared';

import { emptyAndroidIntermediateSigningKey } from '../../@standard/android/response/android-intermediate-signing-key';
import { emptyAndroidPaymentMethodToken } from '../../@standard/android/response/android-payment-method-token';
import { emptyIosPKToken } from '../../@standard/ios/response/ios-pk-token';

import { PaymentResponse } from './payment-response';

import type { AndroidFullAddress } from '../../@standard/android/response/android-full-address';
import type { AndroidMinAddress } from '../../@standard/android/response/android-min-address';
import type { AndroidPaymentData } from '../../@standard/android/response/android-payment-data';
import type { AndroidPaymentMethodToken } from '../../@standard/android/response/android-payment-method-token';
import type { AndroidRawPaymentMethodToken } from '../../@standard/android/response/android-raw-payment-method-token';
import type { AndroidSignedKey } from '../../@standard/android/response/android-signed-key';
import type { AndroidSignedMessage } from '../../@standard/android/response/android-signed-message';
import type { PaymentResponseAddressInterface } from '../../interface/payment-response-address.interface';

export class AndroidPaymentResponse extends PaymentResponse {
    constructor(requestId: string, methodName: string, jsonData: string) {
        const data = JSON.parse(jsonData) as AndroidPaymentData;

        super(requestId, methodName, {
            billingAddress: AndroidPaymentResponse.parseFullAddress(data.paymentMethodData.info.billingAddress),
            androidPayToken: AndroidPaymentResponse.parseToken(data.paymentMethodData.tokenizationData.token),
            applePayToken: emptyIosPKToken,
            payerEmail: data.email,
            ...(isDefined(data.shippingAddress) && {
                payerName: (data.shippingAddress as AndroidMinAddress).name,
                payerPhone: (data.shippingAddress as AndroidMinAddress).phoneNumber ?? '',
            }),
            ...(isDefined(data.paymentMethodData.info.billingAddress) && {
                payerName: (data.paymentMethodData.info.billingAddress as AndroidMinAddress).name,
                payerPhone: (data.paymentMethodData.info.billingAddress as AndroidMinAddress).phoneNumber ?? '',
            }),
            shippingAddress: AndroidPaymentResponse.parseFullAddress(data.shippingAddress),
        });
    }

    private static parseToken(input = '{}'): AndroidPaymentMethodToken {
        if (input === 'examplePaymentMethodToken') {
            return emptyAndroidPaymentMethodToken;
        }

        const parsedToken = JSON.parse(input) as AndroidRawPaymentMethodToken;

        return {
            ...emptyAndroidPaymentMethodToken,
            ...parsedToken,
            rawToken: input,
            intermediateSigningKey: {
                ...(isDefined(parsedToken.intermediateSigningKey)
                    ? {
                          ...parsedToken.intermediateSigningKey,
                          signedKey: JSON.parse(parsedToken.intermediateSigningKey.signedKey) as AndroidSignedKey,
                      }
                    : emptyAndroidIntermediateSigningKey),
            },
            signedMessage: JSON.parse(parsedToken.signedMessage) as AndroidSignedMessage,
        };
    }

    private static parseFullAddress(input?: AndroidFullAddress): PaymentResponseAddressInterface {
        return {
            countryCode: input?.countryCode ?? '',
            postalCode: input?.postalCode ?? '',
            address1: input?.address1 ?? '',
            address2: input?.address2 ?? '',
            address3: input?.address3 ?? '',
            administrativeArea: input?.administrativeArea ?? '',
            locality: input?.locality ?? '',
            sortingCode: input?.sortingCode ?? '',
        };
    }
}
