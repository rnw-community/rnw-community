import { describe, expect, it } from '@jest/globals';

import { EnvironmentEnum } from '../enum/environment.enum.js';

import { validateGooglePayEnvironment } from './validate-google-pay-environment.util.js';

describe('validateGooglePayEnvironment', () => {
    it('should default to PRODUCTION when undefined', () => {
        expect.assertions(1);

         
        expect(validateGooglePayEnvironment(undefined)).toBe(EnvironmentEnum.PRODUCTION);
    });

    it('should return the provided environment when valid', () => {
        expect.assertions(1);

        expect(validateGooglePayEnvironment(EnvironmentEnum.TEST)).toBe(EnvironmentEnum.TEST);
    });

    it('should throw naming the valid environments when given an invalid value', () => {
        expect.assertions(1);

        expect(() => validateGooglePayEnvironment('STAGING' as never)).toThrow(
            'Invalid "googlePayEnvironment" plugin option value: "STAGING". Valid values: "PRODUCTION", "TEST"'
        );
    });
});
