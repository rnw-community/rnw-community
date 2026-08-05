import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { demoStyle } from '../constant/demo-style.js';

import type { EventLogEntryInterface } from '../interface/event-log-entry.interface.js';
import type { ReactNode } from 'react';

interface EventLogViewProps {
    readonly entries: EventLogEntryInterface[];
}

export const EventLogView = ({ entries }: EventLogViewProps): ReactNode => (
    <View style={demoStyle.section}>
        <View style={demoStyle.row}>
            <Text style={demoStyle.title}>Event log</Text>
            <Text style={demoStyle.text} testID="event-log-count">
                {entries.length}
            </Text>
        </View>

        <ScrollView style={demoStyle.log} testID="event-log">
            {entries.map(entry => (
                <Text key={entry.id} style={demoStyle.logRow} testID={`event-log-row-${entry.id}`}>
                    {entry.message}
                </Text>
            ))}
        </ScrollView>
    </View>
);
