# Typescript String type guards
Typescript provide a way to narrow types of variables using [type guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates).

This package provides a set of convenient type guards for everyday usage with `String` type.

> All type guards works as runtime checks and as typescript type guards.

## `isString`

Check if variable is a string type, including empty string.

### Example

```ts
const aString = '';

isString(aString); // returns true and narrows type to string for aString
```

## `isEmptyString`

Check if variable is an empty string type.

### Example

```ts
const emptyString = '';

isEmptyString(emptyString); // returns true and narrows type to string
```

## `isNotEmptyString`

Check if variable is NOT an empty string type.

### Example

```ts
const notEmptyString = 'test';

isNotEmptyString(notEmptyString); // returns true and narrows type to string
```
