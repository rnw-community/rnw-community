# RxJS error utils

Utils that help work with errors in rxjs observable's

## Classes

- `RxjsFilterError` - custom error used by error operators.

## Available operators

- [`filterWithError`](#filterwitherror) - works like `filter` from rxjs, but throw an error instead of ignoring the value.
- [`rethrowExceptionWithLogger`](#rethrowexceptionwithlogger) - will catch any error in the observable, create a
  new `RxJSFilterError` (or any custom) with custom message and log it
  using [@rnw-community/nestjs-rxjs-logger](../nestjs-rxjs-logger). If it catches `RxJSFilterError` (or any custom), it will
  just rethrow that exception as is.

## Usage examples

### filterWithError

If the condition does not pass, will throw `RxJSFilterError` exception with passed in message.

```typescript
import { of } from 'rxjs';
import { filterWithError } from '@rnw-community/rxjs-errors';

of('C')
    .pipe(filterWithError(letter => letter === 'A', letter => `Wanted A, but got ${letter}`))
    .subscribe(value => console.log(value));
```

Passing custom error class:

```typescript
import { filterWithError } from '@rnw-community/rxjs-errors';
import { BadRequestException } from '@nestjs/common';
import { of } from 'rxjs';

of('F')
    .pipe(filterWithError(letter => letter === 'A', letter => `Wanted A, but got ${letter}`, BadRequestException))
    .subscribe(value => console.log(value));
```

Passing a type guard:

```typescript
import { filterWithError } from '@rnw-community/rxjs-errors';
import { of } from 'rxjs';

const value: unknown = '';

const isString = (val: unknown): val is string => typeof val === 'string';

of(value) // `unknown` here
    .pipe(filterWithError(isString, value => `Wanted string, but got ${typeof value}`))
    .subscribe(value /* `string` here */ => {
        console.log(value);
    });
```

You could also just pass in a message instead of a function:

```typescript
import { of } from 'rxjs';
import { filterWithError } from '@rnw-community/rxjs-errors';

of('C')
    .pipe(filterWithError(letter => letter === 'A', 'Invalid letter recevied'))
    .subscribe(value => console.log(value));
```

### rethrowExceptionWithLogger

In this example if the passed in letter is not A, then the `RxJSFilterError` will be thrown with "Invalid character" text.
`rethrowExceptionWithLogger` will log it and throw it again as is.

If the `this.repository.doSomething(letter)` call will throw an error (not an instance of `RxJSFilterError`) it will log the
thrown error, and then create a new one of type `RxJSFilterError` with "Could not check letter" text.

```typescript
import { NestJSRxJSLoggerService } from '@rnw-community/nestjs-rxjs-logger';
import { filterWithError, rethrowExceptionWithLogger } from '@rnw-community/rxjs-errors/src';
import { of } from 'rxjs';

class LetterService {
    constructor(private readonly logger: NestJSRxJSLoggerService, private readonly repository: ILetterRepository) {
    }

    checkLetter$(letter: string): Observable<string> {
        return of(letter).pipe(
            filterWithError(letter !== 'A', "Invalid character"),
            concatMap(letter => this.repository.doSomething(letter)),
            rethrowExceptionWithLogger('Could not check letter', this.logger)
        )
    }
}
```

In this example any error except for `LetterError` will be caught, logged and a `LetterError` will be thrown with a  "Could
not check letter" message.

```typescript
import { NestJSRxJSLoggerService } from '@rnw-community/nestjs-rxjs-logger';
import { filterWithError, rethrowExceptionWithLogger } from '@rnw-community/rxjs-errors/src';
import { of } from 'rxjs';

class LetterError extends Error {
}

class LetterService {
    constructor(private readonly logger: NestJSRxJSLoggerService, private readonly repository: ILetterRepository) {
    }

    checkLetter$(letter: string): Observable<string> {
        return of(letter).pipe(
            filterWithError(letter !== 'A', "Invalid character"),
            concatMap(letter => this.repository.doSomething(letter)),
            rethrowExceptionWithLogger('Could not check letter', this.logger, LetterError)
        )
    }
}
```

You could also pass in a function, that will accept the caught error, to create an error message:

```typescript
import { NestJSRxJSLoggerService } from '@rnw-community/nestjs-rxjs-logger';
import { filterWithError, rethrowExceptionWithLogger } from '@rnw-community/rxjs-errors';
import { getErrorMessage } from '@rnw-community/shared';
import { of } from 'rxjs';

class LetterService {
    constructor(private readonly logger: NestJSRxJSLoggerService, private readonly repository: ILetterRepository) {
    }

    checkLetter$(letter: string): Observable<string> {
        return of(letter).pipe(
            filterWithError(letter !== 'A', "Invalid character"),
            concatMap(letter => this.repository.doSomething(letter)),
            rethrowExceptionWithLogger((err: unknown) => getErrorMessage(err), this.logger)
        )
    }
}
```
