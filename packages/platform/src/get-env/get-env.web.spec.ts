import { describe, expect, it } from '@jest/globals';

import { getEnv } from './get-env.web.js';

describe('getEnvWeb', () => {
    it('should return undefined if variable is not defined', () => {
        expect.hasAssertions();

        expect(getEnv('TEST')).toBeUndefined();
    });
});
