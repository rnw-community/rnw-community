# `getErrorMessage`

Get error message text type-safely in catch blocks, or return fallback message. This is needed when
`error: unknown` is used(this should be used always), fallback message will be returned if `error.message` is missing

## Example

### RxJS
```ts
catchError((error: unknown) => [errorAction(getErrorMessage(error, 'fallback message'))]);
```

### Plain JS
```ts
try {...}
catch(error: unknown) { console.log(getErrorMessage(error)); }
```

