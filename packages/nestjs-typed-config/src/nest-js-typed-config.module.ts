// eslint-disable-next-line max-classes-per-file
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { NestJSTypedConfigService } from './nest-js-typed-config.service';

import type { DynamicModule, Type } from '@nestjs/common';
import type Joi from 'joi';

@Module({})
export class NestJSTypedConfigModule {
    static create<Enum extends string, C extends Record<Enum, boolean | number | string>>(
        validationSchema: Joi.ObjectSchema<C>
    ): [DynamicModule, Type<NestJSTypedConfigService<Enum, C, Extract<keyof C, string>>>] {
        class Service extends NestJSTypedConfigService<Enum, C, Extract<keyof C, string>> {}

        const CustomConfigModule: DynamicModule = {
            imports: [
                ConfigModule.forRoot({
                    cache: true,
                    validationSchema,
                    validationOptions: { abortEarly: false },
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
