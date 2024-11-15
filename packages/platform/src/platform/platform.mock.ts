import { jest } from '@jest/globals';

jest.mock('react-native', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Platform: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        OS: 'no',
    },
}));
