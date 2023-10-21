# Typescript Generic type guards
Typescript provide a way to narrow types of variables using [type guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates).

This package provides a set of convenient type guards for everyday usage.

> All type guards works as runtime checks and as typescript type guards.

## `isDefined`

Check if variable is not `undefined` and is not `null` and narrows its type.

### Example

```ts
const value: Record<string, string> | null = { data: 'value' };

isDefined(value); // returns true and narrows type to Record<string, string>
```

## `isError`

Check if variable is an `Error` instance and narrows its type to the `Error`.

Useful for `try/catch` blocks where `error: unknown`.

### Example

```ts
export const getErrorText = (err: unknown): string => {
    if (isOtherError(err)) {
        return err.response?.data.error_message ?? 'Unknown API error';
    } else if (isError(err)) {
        return err.message;
    }

    return 'Unknown error';
};
```
