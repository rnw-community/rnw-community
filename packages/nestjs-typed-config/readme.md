# NestJS Typed config

NestJS typed configuration with full TypeScript support.

## Installation

Install additional peer dependencies:

- [@nestjs/config](https://github.com/nestjs/config)
- [joi](https://github.com/sideway/joi)

## Configuration

- Create enum with names for all the required environment variable names, interface with type for every environment variable
  and validation schema using joi.

```ts
export enum EnvironmentVariablesEnum {
    POSTGRES_USERNAME = 'POSTGRES_USERNAME',
    POSTGRES_PASSWORD = 'POSTGRES_PASSWORD',
    POSTGRES_HOST = 'POSTGRES_HOST'
}

export interface EnvironmentVariablesInterface {
    [EnvironmentVariablesEnum.POSTGRES_USERNAME]: string;
    [EnvironmentVariablesEnum.POSTGRES_PASSWORD]: string;
    [EnvironmentVariablesEnum.POSTGRES_HOST]: string;
}

import Joi from 'joi';

export const environmentVariablesValidationSchema = Joi.object({
    [EnvironmentVariablesEnum.POSTGRES_USERNAME]: Joi.string().required(),
    [EnvironmentVariablesEnum.POSTGRES_PASSWORD]: Joi.string().required(),
    [EnvironmentVariablesEnum.POSTGRES_HOST]: Joi.string().required(),
});
```

- Create config module and service for NestJS DI, this module and service should be used in the project:

```ts
import { Inject, Injectable } from '@nestjs/common';

import { NestJSTypedConfigModule } from '@rnw-community/nestjs-typed-config';

const [BaseConfigModule, BaseConfigService] = NestJSTypedConfigModule.create<EnvironmentVariablesEnum,
    EnvironmentVariablesInterface>(environmentVariablesValidationSchema);

@Injectable()
export class ConfigService extends BaseConfigService {
}

@Module({
    imports: [BaseConfigModule],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule {
}
```

## Usage

```ts
import { ConfigService } from './config.module.ts';

@Injectable()
class DomainService {
    private readonly postgresPassword: string;

    constructor(private readonly config: ConfigService) {
        this.postgresPassword = config.get(EnvironmentVariablesEnum.POSTGRES_PASSWORD);
    }

    // ...
}
```

### Reading values from files

To read an environment variable from file, the environment variable name should end with `_FILE`:

```ts
export enum EnvironmentVariablesEnum {
    POSTGRES_PASSWORD_FILE = 'POSTGRES_PASSWORD_FILE'
}
```

Value of that environment variable should be a path to the file:

```shell
echo $POSTGRES_PASSWORD_FILE
/secrets/postgres_pwd
```

## TODO

- Perform real-world checks
