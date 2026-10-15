import { unlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { describe, expect, it } from '@jest/globals';
import { Module } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import Joi from 'joi';

import { NestJSTypedConfigModule } from './nest-js-typed-config.module';

import type { DynamicModule } from '@nestjs/common';
import type { ObjectSchema } from 'joi';

enum EnvEnum {
    TEST1 = 'TEST1',
    TEST2 = 'TEST2',
}

enum EnvironmentVariablesEnum {
    ENVIRONMENT_VARIABLE = 'ENVIRONMENT_VARIABLE',
    ENVIRONMENT_VARIABLE_BOOL = 'ENVIRONMENT_VARIABLE_BOOL',
    ENVIRONMENT_VARIABLE_ENUM = 'ENVIRONMENT_VARIABLE_ENUM',
    ENVIRONMENT_VARIABLE_FILE = 'ENVIRONMENT_VARIABLE_FILE',
    ENVIRONMENT_VARIABLE_NUMBER = 'ENVIRONMENT_VARIABLE_NUMBER',
}

interface EnvironmentVariablesInterface {
    [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE]: string;
    [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_BOOL]: boolean;
    [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_ENUM]: EnvEnum;
    [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_FILE]: string;
    [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_NUMBER]: number;
}

const typedValidationSchema = Joi.object<EnvironmentVariablesInterface>({
    [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE]: Joi.string().required(),
    [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_BOOL]: Joi.boolean().required(),
    [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_ENUM]: Joi.string()
        .valid(...Object.values(EnvEnum))
        .default(EnvEnum.TEST1),
    [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_FILE]: Joi.string(),
    [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_NUMBER]: Joi.number().required(),
});

const clearEnvironment = (): void => {
    for (const name of [...Object.values(EnvironmentVariablesEnum), 'UNKNOWN_ENVIRONMENT_VARIABLE']) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete process.env[name];
    }
};

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

    it('should successfully be created if required environment variable is set', async () => {
        expect.assertions(1);

        const validationSchema = Joi.object({
            [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE]: Joi.string().required(),
        }) as unknown as ObjectSchema<EnvironmentVariablesInterface>;

        process.env[EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE] = 'value';

        const [ConfigModule] = NestJSTypedConfigModule.create<EnvironmentVariablesEnum, EnvironmentVariablesInterface>(
            validationSchema
        );

        await expect((ConfigModule.imports ?? [])[0] as Promise<DynamicModule>).resolves.toBeDefined();

        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete process.env[EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE];
    });

    it('should throw an error if required environment variable is not set', async () => {
        expect.assertions(1);

        const validationSchema = Joi.object({
            [EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE]: Joi.string().required(),
        }) as unknown as ObjectSchema<EnvironmentVariablesInterface>;

        const [ConfigModule] = NestJSTypedConfigModule.create<EnvironmentVariablesEnum, EnvironmentVariablesInterface>(
            validationSchema
        );

        await expect((ConfigModule.imports ?? [])[0] as Promise<DynamicModule>).rejects.toThrow(
            `Config validation error: "${EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE}" is required`
        );
    });

    it('should report every invalid environment variable at once', async () => {
        expect.assertions(1);

        process.env[EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_BOOL] = 'not-a-boolean';
        process.env[EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_NUMBER] = 'not-a-number';

        const [ConfigModule] = NestJSTypedConfigModule.create<EnvironmentVariablesEnum, EnvironmentVariablesInterface>(
            typedValidationSchema
        );

        await expect((ConfigModule.imports ?? [])[0] as Promise<DynamicModule>).rejects.toThrow(
            `Config validation error: "${EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE}" is required. "${EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_BOOL}" must be a boolean. "${EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_NUMBER}" must be a number`
        );

        clearEnvironment();
    });

    it('should bootstrap a Nest application context with coerced, defaulted and file-backed values', async () => {
        expect.assertions(5);

        const secretFilePath = join(tmpdir(), `nestjs-typed-config-${process.pid}.secret`);
        writeFileSync(secretFilePath, ' secret-from-file \n');

        process.env[EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE] = 'value';
        process.env[EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_BOOL] = 'true';
        process.env[EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_NUMBER] = '42';
        process.env[EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_FILE] = secretFilePath;
        process.env['UNKNOWN_ENVIRONMENT_VARIABLE'] = 'unknown';

        const [ConfigModule, ConfigService] = NestJSTypedConfigModule.create<
            EnvironmentVariablesEnum,
            EnvironmentVariablesInterface
        >(typedValidationSchema);

        @Module({ imports: [ConfigModule] })
        class AppModule {}

        const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
        const config = new ConfigService(app.get(NestConfigService));

        expect(config.get(EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE)).toBe('value');
        expect(config.get(EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_BOOL)).toBe(true);
        expect(config.get(EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_NUMBER)).toBe(42);
        expect(config.get(EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_ENUM)).toBe(EnvEnum.TEST1);
        expect(config.get(EnvironmentVariablesEnum.ENVIRONMENT_VARIABLE_FILE)).toBe('secret-from-file');

        await app.close();
        unlinkSync(secretFilePath);
        clearEnvironment();
    });
});
