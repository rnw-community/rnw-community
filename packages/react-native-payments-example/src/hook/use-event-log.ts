import { useCallback, useState } from 'react';

import type { EventLogEntryInterface } from '../interface/event-log-entry.interface.js';
import type { EventLogInterface } from '../interface/event-log.interface.js';

export const useEventLog = (): EventLogInterface => {
    const [entries, setEntries] = useState<EventLogEntryInterface[]>([]);

    const log = useCallback((message: string): void => {
        setEntries(currentEntries => [...currentEntries, { id: currentEntries.length, message }]);
    }, []);

    return { entries, log };
};
