# RxJS error utils

Utils that help work with errors in rxjs observable's.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Frxjs-errors.svg)](https://badge.fury.io/js/%40rnw-community%2Frxjs-errors)
[![coverage](https://img.shields.io/codecov/c/github/rnw-community/rnw-community?flag=rxjs-errors&label=coverage)](https://app.codecov.io/gh/rnw-community/rnw-community)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Frxjs-errors.svg)](https://www.npmjs.com/package/%40rnw-community%2Frxjs-errors)

## Classes

### RxJSFilterError

Custom `Error` subclass; the default error created by `filterWithException` when no custom `createError` factory is passed in, and by `rethrowException` when no custom `ErrorCtor` is passed in.

```typescript
import { RxJSFilterError } from '@rnw-community/rxjs-errors';

try {
    throw new RxJSFilterError('Invalid letter received');
} catch (error) {
    if (error instanceof RxJSFilterError) {
        console.error(error.message);
    }
}
```

## Available operators

-   [`filterWithException`](#filterwithexception) - works like `filter` from rxjs, but throw an error instead of ignoring the
    value.

-   [`rethrowException`](#rethrowexception) - will catch any error in the observable, log it with the required logger
    function, and throw a new `RxJSFilterError` (or any custom) with custom message. If it catches `RxJSFilterError` (or any
    custom), it will just rethrow that exception as is.

## Usage examples

### filterWithException

If the condition does not pass, will throw `RxJSFilterError` exception with passed in message.

```typescript
import { of } from 'rxjs';
import { filterWithException } from '@rnw-community/rxjs-errors';

of('C')
    .pipe(
        filterWithException(
            letter => letter === 'A',
            letter => `Wanted A, but got ${letter}`
        )
    )
    .subscribe(value => console.log(value));
```

Passing a custom error factory as the third argument — a `(msg: string) => Error` function, not an error class:

```typescript
import { filterWithException } from '@rnw-community/rxjs-errors';
import { BadRequestException } from '@nestjs/common';
import { of } from 'rxjs';

of('F')
    .pipe(
        filterWithException(
            letter => letter === 'A',
            letter => `Wanted A, but got ${letter}`,
            msg => new BadRequestException(msg)
        )
    )
    .subscribe(value => console.log(value));
```

Passing a type guard:

```typescript
import { filterWithException } from '@rnw-community/rxjs-errors';
import { of } from 'rxjs';

const value: unknown = '';

const isString = (val: unknown): val is string => typeof val === 'string';

of(value) // `unknown` here
    .pipe(filterWithException(isString, value => `Wanted string, but got ${typeof value}`))
    .subscribe((value) /* `string` here */ => {
        console.log(value);
    });
```

You could also just pass in a message instead of a function:

```typescript
import { of } from 'rxjs';
import { filterWithException } from '@rnw-community/rxjs-errors';

of('C')
    .pipe(filterWithException(letter => letter === 'A', 'Invalid letter recevied'))
    .subscribe(value => console.log(value));
```

### rethrowException

In this example if the passed in letter is not A, then the `RxJSFilterError` will be thrown with "Invalid character" text.
`rethrowException` will log it and throw it again as is.

If the `this.repository.doSomething(letter)` call will throw an error (not an instance of `RxJSFilterError`) it will log the
thrown error, and then create a new one of type `RxJSFilterError` with "Could not check letter" text.

```typescript
import { concatMap, of } from 'rxjs';

import { filterWithException, rethrowException } from '@rnw-community/rxjs-errors';

import type { Observable } from 'rxjs';

class LetterService {
    constructor(private readonly repository: ILetterRepository) {}

    checkLetter$(letter: string): Observable<string> {
        return of(letter).pipe(
            filterWithException(value => value === 'A', 'Invalid character'),
            concatMap(letter => this.repository.doSomething(letter)),
            rethrowException('Could not check letter', console.error)
        );
    }
}
```

In this example any error except for `LetterError` will be caught, logged and a `LetterError` will be thrown with a "Could
not check letter" message.

```typescript
import { concatMap, of } from 'rxjs';

import { filterWithException, rethrowException } from '@rnw-community/rxjs-errors';

import type { Observable } from 'rxjs';

class LetterError extends Error {}

class LetterService {
    constructor(private readonly repository: ILetterRepository) {}

    checkLetter$(letter: string): Observable<string> {
        return of(letter).pipe(
            filterWithException(value => value === 'A', 'Invalid character'),
            concatMap(letter => this.repository.doSomething(letter)),
            rethrowException('Could not check letter', console.error, LetterError)
        );
    }
}
```

You could also pass in a function, that will accept the caught error, to create an error message:

```typescript
import { concatMap, of } from 'rxjs';

import { filterWithException, rethrowException } from '@rnw-community/rxjs-errors';
import { getErrorMessage } from '@rnw-community/shared';

import type { Observable } from 'rxjs';

class LetterService {
    constructor(private readonly repository: ILetterRepository) {}

    checkLetter$(letter: string): Observable<string> {
        return of(letter).pipe(
            filterWithException(value => value === 'A', 'Invalid character'),
            concatMap(letter => this.repository.doSomething(letter)),
            rethrowException((err: unknown) => getErrorMessage(err), console.error)
        );
    }
}
```

The log function is required. If you don't want to log anything, pass `emptyFn` from `@rnw-community/shared`:

```typescript
import { concatMap, of } from 'rxjs';

import { filterWithException, rethrowException } from '@rnw-community/rxjs-errors';
import { emptyFn } from '@rnw-community/shared';

import type { Observable } from 'rxjs';

class LetterService {
    constructor(private readonly repository: ILetterRepository) {}

    checkLetter$(letter: string): Observable<string> {
        return of(letter).pipe(
            filterWithException(value => value === 'A', 'Invalid character'),
            concatMap(letter => this.repository.doSomething(letter)),
            rethrowException('Could not check letter', emptyFn)
        );
    }
}
```

## License

This library is licensed under The [MIT License](./LICENSE.md).
