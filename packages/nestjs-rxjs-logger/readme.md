# NestJS RxJS logger

NestJS default logger wrapper for using with RxJS streams.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fnestjs-rxjs-logger.svg)](https://badge.fury.io/js/%40rnw-community%2Fnestjs-rxjs-logger)
[![coverage](https://img.shields.io/codecov/c/github/rnw-community/rnw-community?flag=nestjs-rxjs-logger&label=coverage)](https://app.codecov.io/gh/rnw-community/rnw-community)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fnestjs-rxjs-logger.svg)](https://www.npmjs.com/package/%40rnw-community%2Fnestjs-rxjs-logger)

## Exports

### `AppLogLevelEnum`

`'debug' | 'error' | 'info' | 'verbose' | 'warn'` — the level argument accepted by `NestJSRxJSLoggerService.print` / `create$`; each level also has its own same-named pipeable method (`debug`, `error`, `info`, `verbose`, `warn`) shown below.

```ts
import { AppLogLevelEnum } from '@rnw-community/nestjs-rxjs-logger';

const level: AppLogLevelEnum = AppLogLevelEnum.warn;
```

### `NestJSRxJSLoggerModule`

Provides `NestJSRxJSLoggerService` (bound to NestJS's own `Logger` under the `'LOGGER'` DI token) for your module to import.

```ts
import { Module } from '@nestjs/common';

import { NestJSRxJSLoggerModule } from '@rnw-community/nestjs-rxjs-logger';

@Module({
    imports: [NestJSRxJSLoggerModule],
    providers: [],
    exports: [],
})
export class MyModule {}
```

### `NestJSRxJSLoggerService`

`TRANSIENT`-scoped injectable with one pipeable method per log level (`debug`, `error`, `info`, `verbose`, `warn`), plus `create$` (starts a logged `Observable<boolean>`), `catch` (logs and rethrows), `setContext`, and `print` (imperative logging, no stream involved).

```ts
import { Injectable } from '@nestjs/common';

import { NestJSRxJSLoggerService } from '@rnw-community/nestjs-rxjs-logger';

@Injectable()
export class MyService {
    constructor(private readonly logger: NestJSRxJSLoggerService) {}
}
```

## Usage examples

### Basic operators example

```ts
import { Injectable } from '@nestjs/common';

import { NestJSRxJSLoggerService } from '@rnw-community/nestjs-rxjs-logger';
import { of } from 'rxjs';

import type { Observable } from 'rxjs';

@Injectable()
export class MyService {
    constructor(private readonly logger: NestJSRxJSLoggerService) {}

    loggerOperatorExample$(): Observable<true> {
        return of(true).pipe(this.logger.info('My message', 'OtherContext'));
    }
}
```

### Create stream example

```ts
import { Injectable } from '@nestjs/common';

import { NestJSRxJSLoggerService } from '@rnw-community/nestjs-rxjs-logger';
import { map } from 'rxjs';

import type { Observable } from 'rxjs';

@Injectable()
export class MyService {
    constructor(private readonly logger: NestJSRxJSLoggerService) {}

    loggerCreateStreamExample$(): Observable<number> {
        return this.logger.create$('My message', MyService.name).pipe(map(() => 1));
    }
}
```

### Catch and rethrow example

```ts
import { Injectable } from '@nestjs/common';

import { NestJSRxJSLoggerService } from '@rnw-community/nestjs-rxjs-logger';

import type { Observable } from 'rxjs';

@Injectable()
export class MyService {
    constructor(private readonly logger: NestJSRxJSLoggerService) {}

    loggerCatchExample$(source$: Observable<number>): Observable<number> {
        return source$.pipe(this.logger.catch((error: unknown) => `failed: ${String(error)}`));
    }
}
```

### Set logger context

```ts
import { Injectable } from '@nestjs/common';

import { NestJSRxJSLoggerService } from '@rnw-community/nestjs-rxjs-logger';
import { map, of } from 'rxjs';

import type { Observable } from 'rxjs';

@Injectable()
export class MyService {
    constructor(private readonly logger: NestJSRxJSLoggerService) {
        this.logger.setContext(MyService.name);
    }

    loggerOperatorExample$(): Observable<true> {
        return of(true).pipe(this.logger.info('My message'));
    }

    loggerCreateStreamExample$(): Observable<number> {
        return this.logger.create$('My message').pipe(map(() => 1));
    }
}
```

## License

This library is licensed under The [MIT License](./LICENSE.md).
