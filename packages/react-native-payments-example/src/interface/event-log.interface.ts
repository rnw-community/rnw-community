import type { EventLogEntryInterface } from './event-log-entry.interface';
import type { OnEventFn } from '@rnw-community/shared';

export interface EventLogInterface {
    entries: EventLogEntryInterface[];
    log: OnEventFn<string>;
}
