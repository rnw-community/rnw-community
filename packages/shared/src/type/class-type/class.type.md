# `ClassType<T>`

Generic type for defining constructors from generic type T.

> Useful when you want to check `instanceof` for a variable and need proper generics typing.

## Example

```ts
class MyError extends Error {

}

const handleMyError = (ErrorConstructor: ClassType<MyError>, message: string) => {
    return ErrorConstructor instanceof MyError ? new MyError(message) : new ErrorConstructor(message);
}
```
