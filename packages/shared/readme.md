# Shared

Generic types, type guards and utilities commonly used across packages.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fshared.svg)](https://badge.fury.io/js/%40rnw-community%2Fshared)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fshared.svg)](https://www.npmjs.com/package/%40rnw-community%2Fshared)

## Type guards

Convenient [typescript type guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) for everyday usage.

> This type guards makes your code more explicit, readable and type-safe, both in runtime and typescript.

This package provides a set of convenient type guards for everyday usage with the following types:

- Array:
  - [isEmptyArray](src/type-guard/array/is-empty-array/is-empty-array.md)
  - [isNotEmptyArray](src/type-guard/array/is-not-empty-array/is-not-empty-array.md)
- String:
  - [isString](src/type-guard/string/is-string/is-string.md)
  - [isEmptyString](src/type-guard/string/is-empty-string/is-empty-string.md)
  - [isNotEmptyString](src/type-guard/string/is-not-empty-string/is-not-empty-string.md)
- Number:
  - [isNumber](src/type-guard/number/is-number/is-number.md)
  - [isPositiveNumber](src/type-guard/number/is-positive-number/is-positive-number.md)
- Generic:
  - [isDefined](src/type-guard/generic/is-defined/is-defined.md)
  - [isError](src/type-guard/generic/is-error/is-error.md)

## Utils

Utility functions that helps with everyday tasks:
- [getErrorMessage](src/util/get-error-message/get-error-message.md) - Get typesafe Error object message.
- [emptyFn](src/util/empty-fn/empty-fn.md) - Useful default react prop callback value.
- [cs](src/util/cs/cs.md) - Conditional styling util.
- [getDefined](src/util/get-defined/get-defined.md) - Get fallback value if passed variable is not defined.
- [getDefinedAsync](src/util/get-defined-async/get-defined-async.md) - Get async fallback value if passed variable is not defined.

## Types

Commonly used typescript types:

- [ClassType](src/type/class-type/class.type.md)
- [Maybe](src/type/maybe-type/maybe-type.md)
- [OnEventFn](src/type/on-event-fn-type/on-event-fn.type.md)
- [EmptyFn](src/type/empty-fn-type/empty-fn.type.md)
- [Enum](src/type/enum-type/enum-type.md)

## License

This library is licensed under The [MIT License](./LICENSE.md).
