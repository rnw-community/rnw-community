/* eslint-disable @typescript-eslint/naming-convention */
import { describe, expect, it } from '@jest/globals';
import Joi from 'joi';

import { NestJSTypedConfigModule } from './nest-js-typed-config.module';

import type { ObjectSchema } from 'joi';

enum EnvEnum {
    TEST1 = 'TEST1',
    TEST2 = 'TEST2',
}

enum EnvironmentVariablesEnum {
    ENVIRONMENT_VARIABLE = 'ENVIRONMENT_VARIABLE',
    ENVIRONMENT_VARIABLE_BOOL = 'ENVIRONMENT_VARIABLE_BOOL',
    ENVIRONMENT_VARIABLE_ENUM = 'ENVIRONMENT_VARIABLE_ENUM',
    ENVIRONMENT_VARIABLE_NUMBER = 'ENVIRONMENT_VARIABLE_NUMBER',
}

interface EnvironmentVariablesInterface {
    [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE]: string;
    [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_BOOL]: boolean;
    [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_ENUM]: EnvEnum;
    [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_NUMBER]: number;
}

describe('NestJSTypedConfigModule', () => {
    it('should create type config module with exported service', () => {
        expect.assertions(3);

        const validationSchema = Joi.object({}) as unknown as ObjectSchema<EnvironmentVariablesInterface>;

        const [ConfigModule, ConfigService] = NestJSTypedConfigModule.create<
            EnvironmentVariablesEnum,
            EnvironmentVariablesInterface
        >(validationSchema);

        expect(ConfigModule.exports).toContain(ConfigService);
        expect(ConfigModule.providers).toContain(ConfigService);
        expect(typeof ConfigService === 'function').toBeTruthy();
    });

    it('should successfully be created if required environment variable is set', () => {
        expect.assertions(1);

        const validationSchema = Joi.object({
            [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE]: Joi.string().required(),
        }) as unknown as ObjectSchema<EnvironmentVariablesInterface>;

        process.env[EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE] = 'value';

        expect(() =>
            NestJSTypedConfigModule.create<EnvironmentVariablesEnum, EnvironmentVariablesInterface>(validationSchema)
        ).not.toThrow();

        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete process.env[EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE];
    });

    it('should throw an error if required environment variable is not set', () => {
        expect.assertions(1);

        const validationSchema = Joi.object({
            [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE]: Joi.string().required(),
        }) as unknown as ObjectSchema<EnvironmentVariablesInterface>;

        expect(() =>
            NestJSTypedConfigModule.create<EnvironmentVariablesEnum, EnvironmentVariablesInterface>(validationSchema)
        ).toThrow(`Config validation error: "${EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE}" is required`);
    });
});
