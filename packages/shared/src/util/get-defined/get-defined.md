# `getDefined`

Checks if value is defined and returns it, otherwise returns a result of `defaultFn`

## Example

```ts
expect(getDefined(undefined, () => 'default value')).toEqual('default value');
expect(getDefined(null, () => 'default value')).toEqual('default value');
expect(getDefined('defined value', () => 'default value')).toEqual('defined value');
```
