import React from 'react';
import { Text, View } from 'react-native';

import { demoStyle } from '../constant/demo-style';
import { getPaymentName } from '../util/get-payment-name';

import type { ReactNode } from 'react';

interface DemoStatusProps {
    readonly canMakePaymentStatus: string;
    readonly flowState: string;
}

export const DemoStatus = ({ canMakePaymentStatus, flowState }: DemoStatusProps): ReactNode => (
    <View style={demoStyle.section}>
        <Text style={demoStyle.title}>{`${getPaymentName()} status`}</Text>

        <View style={demoStyle.row}>
            <Text style={demoStyle.text}>canMakePayment</Text>
            <Text style={demoStyle.text} testID="payments-can-make-status">
                {canMakePaymentStatus}
            </Text>
        </View>

        <View style={demoStyle.row}>
            <Text style={demoStyle.text}>flow</Text>
            <Text style={demoStyle.text} testID="payments-flow-state">
                {flowState}
            </Text>
        </View>
    </View>
);
