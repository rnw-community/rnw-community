import { formatLogMessage } from './format-log-message.js';

import type { OnEventFn } from '@rnw-community/shared';

export const createFlowStateGuard = (
    isCurrentRequest: () => boolean,
    setFlowState: OnEventFn<string>,
    log: OnEventFn<string>
): OnEventFn<string> => {
    const guardedSetFlowState = (flowState: string): void => {
        if (!isCurrentRequest()) {
            log(formatLogMessage('show settled after reset', { ignored: flowState }));

            return;
        }

        setFlowState(flowState);
    };

    return guardedSetFlowState;
};
