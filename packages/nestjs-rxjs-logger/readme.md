# NestJS RxJS logger

NestJS default logger wrapper for using with RxJS streams.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fnestjs-rxjs-logger.svg)](https://badge.fury.io/js/%40rnw-community%2Fnestjs-rxjs-logger)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fnestjs-rxjs-logger.svg)](https://www.npmjs.com/package/%40rnw-community%2Fnestjs-rxjs-logger)

## Supported log levels

-   `error` - `error$` RxJS operator
-   `info` - `info$` RxJS operator
-   `warn` - `warn$` RxJS operator
-   `debug` - `debug$` RxJS operator
-   `verbose` - `verbose$` RxJS operator

## Configuration

Import `NestJsRxJsLoggerModule` into your module:

```ts
import { Logger, Module } from '@nestjs/common';
import { NestJsRxjsLoggerService } from '@rnw-community/nestjs-rxjs-logger';

@Module({
    imports: [NestJsRxJsLoggerModule],
    providers: [],
    exports: [],
})
export class MyModule {}
```

Inject `NestJsRxjsLoggerService` into your service:

```ts
import { Injectable } from '@nestjs/common';
import { NestJsRxjsLoggerService } from '@rnw-community/nestjs-rxjs-logger';
import { mapTo } from 'rxjs';

@Injectable()
export class MyService {
    constructor(private readonly logger: NestJsRxjsLoggerService) {}
}
```

## Usage examples

### Basic operators example

```ts
import { Injectable } from '@nestjs/common';
import { NestJsRxjsLoggerService } from '@rnw-community/nestjs-rxjs-logger';
import { mapTo } from 'rxjs';

@Injectable()
export class MyService {
    constructor(private readonly logger: NestJsRxjsLoggerService) {}

    loggerOperatorExample$(): Observable<true> {
        return of(true).pipe(this.logger.info$('My message', 'OtherContext'));
    }
}
```

### Create stream example

```ts
import { Injectable } from '@nestjs/common';
import { NestJsRxjsLoggerService } from '@rnw-community/nestjs-rxjs-logger';
import { mapTo } from 'rxjs';

@Injectable()
export class MyService {
    constructor(private readonly logger: NestJsRxjsLoggerService) {}

    loggerCreateStreamExample$(): Observable<number> {
        return this.logger.create$('My message', MyService.name).pipe(mapTo(1));
    }
}
```

### Set logger context

```ts
import { Injectable } from '@nestjs/common';
import { NestJsRxjsLoggerService } from '@rnw-community/nestjs-rxjs-logger';
import { mapTo } from 'rxjs';

@Injectable()
export class MyService {
    constructor(private readonly logger: NestJsRxjsLoggerService) {
        this.logger.setContext(MyService.name);
    }

    loggerOperatorExample$(): Observable<true> {
        return of(true).pipe(this.logger.info$('My message'));
    }

    loggerCreateStreamExample$(): Observable<number> {
        return this.logger.create$('My message').pipe(mapTo(1));
    }
}
```

## License

This library is licensed under The [MIT License](./LICENSE.md).
