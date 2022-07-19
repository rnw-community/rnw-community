# Shared - React native web community

Generic types and utilities commonly used across packages.

## Types

### `Maybe<T>`

Generic type for declaring input type `T` to be nullable.

### `OnEventFn<T, R>`

Generic function type with input type `T` and return type `R`.

#### Example

```tsx
interface Props {
    onSelectIxd?: OnEventFn<number>;
}

export const Component = ({ onClick = emptyFn }: Props) => {
    return <View onClick={() => onClick(Math.random(2))} />;
};
```

### `ClassType<T>`

Generic type for defining constructors from generic type T.

#### Example

Useful when you want to check `instanceof` for a variable and need proper generics typing.

```ts
class MyError extends Error {...}

const handleMyError = (ErrorConstructor: ClassType<MyError>, message: string) => {
    return ErrorConstructor instanceof MyError ? new MyError(message) : new ErrorConstructor(message);
}
```

## Utils

Utility functions that helps with everyday tasks.

### Conditional styling `cs`

`cs(condition: boolean, trueStyle: StyleType, falseStyle?: StyleType): StyleType`

Returns `trueStyle` object if `condition` is true,
otherwise returns `falseStyle` object which defaults to `{}`.

#### Example

Useful for React Native styles:

```tsx
const rootStyles = [Styles.root, cs(isActive, Styles.rootActive), cs(isDisabled, Styles.rootDisabled)];

const buttonStyles = cs(isActive, Styles.buttonActive, Styles.buttonDisabled);
```

### `emptyFn`

Function that has not implementation and returns void.

#### Example

Useful for React nad other event handlers default value to avoid condition checks.

```tsx
interface Props {
    onClick?: OnEventFn;
}

export const Component = ({ onClick = emptyFn }: Props) => <View onClick={onClick} />;
```

### `getErrorMessage`

Get error message text type-safely in catch blocks, or return fallback message. This is needed when
`error: unknown` is used(this should be used always), fallback message will be returned if `error.message is missing

#### Example

```ts
// RxJS
catchError((error: unknown) => [errorAction(getErrorMessage(error, 'fallback message'))]);
```

```ts
try {...}
catch(error: unknown) { console.log(getErrorMessage(error)); }
```

## Type guards

Convenient [typescript type guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) for everyday usage.

### `isDefined`

Check if variable is not `undefined` and is not `null`.

#### Example

```ts
const value: Record<string, string> | null = { data: 'value' };

isDefined(value); // returns true and narrows type to Record<string, string>
```

### `isString`

Check if variable is a string.

#### Example

```ts
const aString = '';

isString(aString); // returns true and narrows type to string for aString
```

### `isEmptyString`

Check if variable is an empty string.

#### Example

```ts
const emptyString = '';

isEmptyString(emptyString); // returns true and narrows type to string
```

### `isNotEmptyString`

Check if variable is NOT an empty string.

#### Example

```ts
const notEmptyString = 'test';

isNotEmptyString(notEmptyString); // returns true and narrows type to string
```

### `isNotEmptyArray`

Check if variable is NOT an empty string.

#### Example

```ts
const notEmptyArray = ['test'];

isNotEmptyArray(notEmptyArray); // returns true and narrows type to array of strings
```

### `isError`

Check if variable is an Error. Useful for `try/catch` blocks where `error: unknown`.

#### Example

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
