import React from 'react';
import { Button, Text, View } from 'react-native';

import { demoStyle } from '../constant/demo-style';
import { getPaymentName } from '../util/get-payment-name';

import type { EmptyFn } from '@rnw-community/shared';
import type { ReactNode } from 'react';

interface DemoActionsProps {
    readonly onAbort: EmptyFn;
    readonly onReset: EmptyFn;
    readonly onShow: EmptyFn;
}

export const DemoActions = ({ onShow, onAbort, onReset }: DemoActionsProps): ReactNode => (
    <View style={demoStyle.section}>
        <Text style={demoStyle.title}>Actions</Text>

        <Button onPress={onShow} testID="action-show" title={`Show ${getPaymentName()} sheet`} />
        <Button onPress={onAbort} testID="action-abort" title="Abort active request" />
        <Button onPress={onReset} testID="action-reset" title="New request" />
    </View>
);
