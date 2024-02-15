import { jest } from '@jest/globals';

jest.mock('react-native', () => ({
    Platform: {
        OS: 'no',
    },
}));
