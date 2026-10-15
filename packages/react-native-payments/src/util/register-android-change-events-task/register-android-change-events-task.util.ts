import { AppRegistry } from 'react-native';

import { emptyFn } from '@rnw-community/shared';

import { androidChangeEventsTaskKey } from '../../constant/android-change-events-task-key';

let isAndroidChangeEventsTaskRegistered = false;

const keepJsTimersRunning = (): Promise<void> => new Promise<void>(emptyFn);

export const registerAndroidChangeEventsTask = (): void => {
    if (isAndroidChangeEventsTaskRegistered) {
        return;
    }

    isAndroidChangeEventsTaskRegistered = true;
    AppRegistry.registerHeadlessTask(androidChangeEventsTaskKey, () => keepJsTimersRunning);
};
