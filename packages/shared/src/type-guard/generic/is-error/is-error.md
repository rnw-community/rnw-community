# `isError`

Check if variable is an `Error` instance and narrows its type to the `Error`.

Useful for `try/catch` blocks where `error: unknown`.

## Example

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
