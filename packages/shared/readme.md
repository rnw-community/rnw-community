# Shared

Generic types, type guards and utilities commonly used across packages.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fshared.svg)](https://badge.fury.io/js/%40rnw-community%2Fshared)
[![coverage](https://img.shields.io/codecov/c/github/rnw-community/rnw-community?flag=shared&label=coverage)](https://app.codecov.io/gh/rnw-community/rnw-community)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fshared.svg)](https://www.npmjs.com/package/%40rnw-community%2Fshared)

## Type guards

Convenient [TypeScript type guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) for everyday usage.

> These type guards make your code more explicit, readable, and type-safe — both at runtime and in TypeScript's flow analysis.

- Generic:
    - [isDefined](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/generic/is-defined/is-defined.md)
    - [isError](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/generic/is-error/is-error.md)
    - [isObject](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/generic/is-object/is-object.md)
    - [isPromise](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/generic/is-promise/is-promise.md)
    - [isRecord](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/generic/is-record/is-record.md) - non-array objects that are safe to index by key
- Array:
    - [isArray](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/array/is-array/is-array.md)
    - [isEmptyArray](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/array/is-empty-array/is-empty-array.md)
    - [isNotEmptyArray](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/array/is-not-empty-array/is-not-empty-array.md)
    - [isNotEmptyArrayOf](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/array/is-not-empty-array-of/is-not-empty-array-of.md)
- String:
    - [isString](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/string/is-string/is-string.md)
    - [isEmptyString](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/string/is-empty-string/is-empty-string.md)
    - [isNotEmptyString](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/string/is-not-empty-string/is-not-empty-string.md)
    - [isDecimalMonetaryValue](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/string/is-decimal-monetary-value/is-decimal-monetary-value.md) - decimal-formatted numeric string, e.g. currency amounts
- Number:
    - [isNumber](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/number/is-number/is-number.md)
    - [isPositiveNumber](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/number/is-positive-number/is-positive-number.md)
- Boolean:
    - [isBoolean](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/boolean/is-boolean/is-boolean.md)

## Utils

Utility functions that helps with everyday tasks:

- [getErrorMessage](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/util/get-error-message/get-error-message.md) - Get typesafe Error object message.
- [emptyFn](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/util/empty-fn/empty-fn.md) - Useful default react prop callback value.
- [cs](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/util/cs/cs.md) - Conditional styling util.
- [getDefined](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/util/get-defined/get-defined.md) - Get fallback value if passed variable is not defined.
- [wait](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/util/wait/wait.md) - Promise-based sleep via `setTimeout`.

## Types

Commonly used typescript types:

- [ClassType](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/class-type/class.type.md)
- [Maybe](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/maybe-type/maybe.type.md)
- [OnEventFn](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/on-event-fn-type/on-event-fn.type.md)
- [EmptyFn](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/empty-fn-type/empty-fn.type.md)
- [Enum](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/enum-type/enum.type.md)
- [IsNotEmptyArray](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/is-not-empty-array-type/is-not-empty-array.type.md)
- [ReadonlyIsNotEmptyArray](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/readonly-is-not-empty-array-type/readonly-is-not-empty-array.type.md)
- [AnyFn](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/any-fn-type/any-fn.type.md)
- [AbstractConstructor](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/abstract-constructor-type/abstract-constructor.type.md)
- [MethodDecoratorType](https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/method-decorator-type/method-decorator.type.md)

## License

This library is licensed under The [MIT License](./LICENSE.md).
