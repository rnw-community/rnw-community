// eslint-disable-next-line max-classes-per-file
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createJoiConfigValidator } from './create-joi-config-validator/create-joi-config-validator';
import { NestJSTypedConfigService } from './nest-js-typed-config.service';

import type { DynamicModule, Type } from '@nestjs/common';
import type Joi from 'joi';

/**
 * The NestJS module factory providing environment configuration validated by a Joi schema and read through a typed service.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-typed-config/readme.md#nestjstypedconfigmodule
 */
@Module({})
export class NestJSTypedConfigModule {
    /**
     * Returns a global `[module, service]` tuple validating the environment against the Joi schema and exposing a `NestJSTypedConfigService` typed by it.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-typed-config/readme.md#nestjstypedconfigmodule
     */
    static create<Enum extends string, C extends Record<Enum, boolean | number | string>>(
        validationSchema: Joi.ObjectSchema<C>
    ): [DynamicModule, Type<NestJSTypedConfigService<Enum, C, Extract<keyof C, string>>>] {
        class Service extends NestJSTypedConfigService<Enum, C, Extract<keyof C, string>> {}

        const CustomConfigModule: DynamicModule = {
            imports: [
                ConfigModule.forRoot({
                    cache: true,
                    validate: createJoiConfigValidator(validationSchema),
                    isGlobal: true,
                }),
            ],
            providers: [Service],
            exports: [Service],
            module: NestJSTypedConfigModule,
            global: true,
        };

        return [CustomConfigModule, Service];
    }
}
