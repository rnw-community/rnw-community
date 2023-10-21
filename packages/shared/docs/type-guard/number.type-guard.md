# Typescript Number type guards
Typescript provide a way to narrow types of variables using [type guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates).

This package provides a set of convenient type guards for everyday usage with `Number` type.

> All type guards works as runtime checks and as typescript type guards.

## `isNumber`
Check if variable is a number type, including `NaN`.

### Example

```ts
const aNumber = 0;

isNumber(aNumber); // returns true and narrows type to number for aNumber
```

## `isPositiveNumber`
Check if variable is a positive number type, excluding `0`.

### Example

```ts
const positiveNumber = 1;

isPositiveNumber(aNumber); // returns true and narrows type to number for aNumber

const negativeNumber = -1;

isPositiveNumber(negativeNumber); // returns false
```
