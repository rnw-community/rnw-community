# `isDefined`

Check if variable is not `undefined` and is not `null` and narrows its type.

## Example

```ts
const value: Record<string, string> | null = { data: 'value' };

isDefined(value); // returns true and narrows type to Record<string, string>
```
