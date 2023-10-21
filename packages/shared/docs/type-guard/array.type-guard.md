# Typescript Array type guards
Typescript provide a way to narrow types of variables using [type guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates).

This package provides a set of convenient type guards for everyday usage with `Array` type.

> All type guards works as runtime checks and as typescript type guards.


## `isEmptyArray`

Check if variable IS an empty array type.

### Example

```ts
const emptyArray = [];

isEmptyArray(emptyArray); // returns true and narrows type to array
```


## `isNotEmptyArray`

Check if variable is NOT an empty array type.

### Example

```ts
const notEmptyArray = ['test'];

isNotEmptyArray(notEmptyArray); // returns true and narrows type to array of strings
```
