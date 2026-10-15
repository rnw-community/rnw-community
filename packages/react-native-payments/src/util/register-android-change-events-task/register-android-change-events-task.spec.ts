import { describe, expect, it, jest } from '@jest/globals';
import { AppRegistry } from 'react-native';

import { androidChangeEventsTaskKey } from '../../constant/android-change-events-task-key';

import { registerAndroidChangeEventsTask } from './register-android-change-events-task.util';

jest.mock('react-native', () => ({
    AppRegistry: {
        registerHeadlessTask: jest.fn(),
    },
}));

type HeadlessTaskProvider = () => (data: unknown) => Promise<void>;

describe('registerAndroidChangeEventsTask', () => {
    it('should register the change events task once with a task that stays pending', async () => {
        expect.hasAssertions();

        registerAndroidChangeEventsTask();
        registerAndroidChangeEventsTask();

        const registerHeadlessTaskMock = jest.mocked(AppRegistry.registerHeadlessTask);

        expect(registerHeadlessTaskMock).toHaveBeenCalledTimes(1);

        const [[taskKey, taskProvider]] = registerHeadlessTaskMock.mock.calls;
        const taskSettlement = (taskProvider as HeadlessTaskProvider)()({}).then(() => 'settled');

        expect(taskKey).toBe(androidChangeEventsTaskKey);
        await expect(Promise.race([taskSettlement, Promise.resolve('pending')])).resolves.toBe('pending');
    });
});
