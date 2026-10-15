import { describe, expect, it } from '@jest/globals';
import Joi from 'joi';

import { createJoiConfigValidator } from './create-joi-config-validator';

interface ConfigInterface {
    BOOL: boolean;
    NUMBER: number;
    STRING: string;
    WITH_DEFAULT: string;
}

const schema = Joi.object<ConfigInterface>({
    BOOL: Joi.boolean().required(),
    NUMBER: Joi.number().required(),
    STRING: Joi.string().required(),
    WITH_DEFAULT: Joi.string().default('default-value'),
});

describe('createJoiConfigValidator', () => {
    it('should coerce string environment values into their schema types', () => {
        expect.hasAssertions();

        const validate = createJoiConfigValidator(schema);

        expect(validate({ BOOL: 'true', NUMBER: '42', STRING: 'value' })).toMatchObject({
            BOOL: true,
            NUMBER: 42,
            STRING: 'value',
        });
    });

    it('should apply schema defaults for missing values', () => {
        expect.hasAssertions();

        const validate = createJoiConfigValidator(schema);

        expect(validate({ BOOL: 'false', NUMBER: '1', STRING: 'value' })).toMatchObject({ WITH_DEFAULT: 'default-value' });
    });

    it('should keep unknown environment variables untouched', () => {
        expect.hasAssertions();

        const validate = createJoiConfigValidator(schema);

        expect(validate({ BOOL: 'false', NUMBER: '1', STRING: 'value', UNKNOWN_VARIABLE: 'unknown' })).toMatchObject({
            UNKNOWN_VARIABLE: 'unknown',
        });
    });

    it('should report every invalid value in a single config validation error', () => {
        expect.hasAssertions();

        const validate = createJoiConfigValidator(schema);

        expect(() => validate({ BOOL: 'not-a-boolean', NUMBER: 'not-a-number' })).toThrow(
            'Config validation error: "BOOL" must be a boolean. "NUMBER" must be a number. "STRING" is required'
        );
    });
});
