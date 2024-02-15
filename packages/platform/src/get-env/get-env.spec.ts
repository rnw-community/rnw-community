import { describe, expect, it, jest } from '@jest/globals';

import { getEnv } from './get-env';

jest.mock('react-native-config', () => ({}));

describe('getEnv', () => {
    it('should return undefined if variable is not defined', () => {
        expect.hasAssertions();

        expect(getEnv('TEST')).toBeUndefined();
    });
});
