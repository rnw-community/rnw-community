import { existsSync, readFileSync } from 'fs';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { isNotEmptyString } from '@rnw-community/shared';

import type { EnvType } from './env.type';

/* eslint-disable class-methods-use-this */
@Injectable()
export class NestJSTypedConfigService<
    EnvEnum extends string,
    EnvTypes extends Record<EnvEnum, boolean | number | string>,
    EnvKeys extends Extract<keyof EnvTypes, string> = Extract<keyof EnvTypes, string>
> {
    private readonly envCache = new Map();

    constructor(private readonly config: ConfigService<EnvTypes>) {}

    public get<T extends EnvKeys>(envVariable: T): EnvType<EnvTypes, T> {
        if (this.envCache.has(envVariable)) {
            const value = this.envCache.get(envVariable) as EnvType<EnvTypes, T>;
            Logger.debug(`Using env variable "${envVariable}" from cache`, NestJSTypedConfigService.name);

            return value;
        }

        const variableValue = this.config.get<EnvType<EnvTypes, T>>(envVariable);

        if (envVariable.includes('_FILE')) {
            const fileEnvValue = this.handleFileEnvVariable(envVariable, variableValue);
            this.envCache.set(envVariable, fileEnvValue);

            return fileEnvValue;
        }

        this.envCache.set(envVariable, variableValue);
        Logger.debug(`Using env variable "${envVariable}"`, NestJSTypedConfigService.name);

        return variableValue as unknown as EnvType<EnvTypes, T>;
    }

    private handleFileEnvVariable<T extends EnvKeys>(envVariable: T, filePath?: EnvType<EnvTypes, T>): EnvType<EnvTypes, T> {
        if (isNotEmptyString(filePath)) {
            Logger.debug(`Using env variable "${envVariable}" from file "${filePath}"`, NestJSTypedConfigService.name);

            return this.readFileEnvFromFS<T>(envVariable, filePath);
        }

        return this.readFileEnvFromEnvironment<T>(envVariable);
    }

    private readFileEnvFromEnvironment<T extends EnvKeys>(envVariable: T): EnvType<EnvTypes, T> {
        /* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
        const value = this.config.get(envVariable.replace('_FILE', '') as T) as EnvType<EnvTypes, T>;

        Logger.debug(
            `Using env variable "${envVariable}" from environment "${value as string}"`,
            NestJSTypedConfigService.name
        );

        return value;
    }

    private readFileEnvFromFS<T extends EnvKeys>(envVariable: T, variableValue: EnvType<EnvTypes, T>): EnvType<EnvTypes, T> {
        if (!existsSync(variableValue as string)) {
            throw new Error(`Could not read file "${envVariable}"`);
        }

        return readFileSync(variableValue as string)
            .toString()
            .trim() as EnvType<EnvTypes, T>;
    }
}
