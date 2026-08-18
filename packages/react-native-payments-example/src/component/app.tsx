import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

import { demoStyle } from '../constant/demo-style';
import { useEventLog } from '../hook/use-event-log';
import { usePaymentDemo } from '../hook/use-payment-demo';
import { useRequestOptions } from '../hook/use-request-options';

import { DemoActions } from './demo-actions';
import { DemoStatus } from './demo-status';
import { EventLogView } from './event-log-view';
import { RequestBuilderForm } from './request-builder-form';

export const App = (): React.JSX.Element => {
    const { entries, log } = useEventLog();
    const { options, toggleOption, setTotalValue } = useRequestOptions();
    const { canMakePaymentStatus, flowState, showRequest, abortRequest, resetRequest } = usePaymentDemo(options, log);

    return (
        <SafeAreaView style={demoStyle.screen}>
            <ScrollView contentContainerStyle={demoStyle.scrollContent}>
                <DemoStatus canMakePaymentStatus={canMakePaymentStatus} flowState={flowState} />
                <RequestBuilderForm onOptionToggle={toggleOption} onTotalChange={setTotalValue} options={options} />
                <DemoActions onAbort={abortRequest} onReset={resetRequest} onShow={showRequest} />
                <EventLogView entries={entries} />
            </ScrollView>
        </SafeAreaView>
    );
};
