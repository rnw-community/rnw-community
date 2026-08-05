import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

import { demoStyle } from '../constant/demo-style.js';
import { useEventLog } from '../hook/use-event-log.js';
import { usePaymentDemo } from '../hook/use-payment-demo.js';
import { useRequestOptions } from '../hook/use-request-options.js';

import { DemoActions } from './demo-actions.js';
import { DemoStatus } from './demo-status.js';
import { EventLogView } from './event-log-view.js';
import { RequestBuilderForm } from './request-builder-form.js';

export const App = (): React.JSX.Element => {
    const { entries, log } = useEventLog();
    const { options, toggleOption, setTotalValue } = useRequestOptions();
    const { canMakePaymentStatus, flowState, showRequest, abortRequest, resetRequest } = usePaymentDemo(options, log);

    return (
        <SafeAreaView style={demoStyle.screen}>
            <ScrollView>
                <DemoStatus canMakePaymentStatus={canMakePaymentStatus} flowState={flowState} />
                <RequestBuilderForm onOptionToggle={toggleOption} onTotalChange={setTotalValue} options={options} />
                <DemoActions onAbort={abortRequest} onReset={resetRequest} onShow={showRequest} />
                <EventLogView entries={entries} />
            </ScrollView>
        </SafeAreaView>
    );
};
