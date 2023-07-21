import { isDefined } from '@rnw-community/shared';

import { PaymentResponse } from './payment-response';

import type { AndroidFullAddress } from '../../@standard/android/response/android-full-address';
import type { AndroidMinAddress } from '../../@standard/android/response/android-min-address';
import type { AndroidPaymentData } from '../../@standard/android/response/android-payment-data';
import type { AndroidPaymentDataToken } from '../../@standard/android/response/android-payment-data-token';
import type { PaymentResponseAddressInterface } from '../../interface/payment-response-address.interface';

export class AndroidPaymentResponse extends PaymentResponse<AndroidPaymentDataToken> {
    constructor(requestId: string, methodName: string, jsonData: string) {
        const data = JSON.parse(jsonData) as AndroidPaymentData;

        super(requestId, methodName, {
            billingAddress: AndroidPaymentResponse.parseFullAddress(data.paymentMethodData.info.billingAddress),
            details: JSON.parse(data.paymentMethodData.tokenizationData.token ?? '{}') as AndroidPaymentDataToken,
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
