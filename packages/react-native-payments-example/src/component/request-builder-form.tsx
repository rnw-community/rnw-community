import React from 'react';
import { Text, View } from 'react-native';

import { demoStyle } from '../constant/demo-style';

import { SwitchRow } from './switch-row';
import { TextInputRow } from './text-input-row';

import type { RequestOptionsInterface } from '../interface/request-options.interface';
import type { RequestOptionToggleType } from '../type/request-option-toggle.type';
import type { OnEventFn } from '@rnw-community/shared';
import type { ReactNode } from 'react';

interface RequestBuilderFormProps {
    readonly onOptionToggle: OnEventFn<RequestOptionToggleType>;
    readonly onTotalChange: OnEventFn<string>;
    readonly options: RequestOptionsInterface;
}

export const RequestBuilderForm = ({ options, onOptionToggle, onTotalChange }: RequestBuilderFormProps): ReactNode => (
    <View style={demoStyle.section}>
        <Text style={demoStyle.title}>Request builder</Text>

        <TextInputRow onChangeText={onTotalChange} testID="builder-total-input" text="total" value={options.totalValue} />

        <SwitchRow
            onToggle={() => void onOptionToggle('requestShipping')}
            testID="builder-shipping-toggle"
            text="requestShipping"
            value={options.requestShipping}
        />
        <SwitchRow
            onToggle={() => void onOptionToggle('coupon')}
            testID="builder-coupon-toggle"
            text="couponCode (iOS)"
            value={options.coupon}
        />
        <SwitchRow
            onToggle={() => void onOptionToggle('asyncUpdate')}
            testID="builder-async-update-toggle"
            text="async updateWith"
            value={options.asyncUpdate}
        />
        <SwitchRow
            onToggle={() => void onOptionToggle('showDisplayItems')}
            testID="builder-display-items-toggle"
            text="showDisplayItems"
            value={options.showDisplayItems}
        />
        <SwitchRow
            onToggle={() => void onOptionToggle('requestBillingAddress')}
            testID="builder-billing-address-toggle"
            text="requestBillingAddress"
            value={options.requestBillingAddress}
        />
        <SwitchRow
            onToggle={() => void onOptionToggle('requestPayerEmail')}
            testID="builder-payer-email-toggle"
            text="requestPayerEmail"
            value={options.requestPayerEmail}
        />
        <SwitchRow
            onToggle={() => void onOptionToggle('requestPayerName')}
            testID="builder-payer-name-toggle"
            text="requestPayerName"
            value={options.requestPayerName}
        />
        <SwitchRow
            onToggle={() => void onOptionToggle('requestPayerPhone')}
            testID="builder-payer-phone-toggle"
            text="requestPayerPhone"
            value={options.requestPayerPhone}
        />
    </View>
);
