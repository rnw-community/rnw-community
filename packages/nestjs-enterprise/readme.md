# NestJS Enterprise

NestJS enterprise is a collection of tools and utilities to help you build enterprise-grade applications with NestJS.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fnestjs-enterprise.svg)](https://badge.fury.io/js/%40rnw-community%2Fnestjs-enterprise)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fnestjs-enterprise.svg)](https://www.npmjs.com/package/%40rnw-community%2Fnestjs-enterprise)


## Installation

Add `@rnw-community/nestjs-enterprise` to your project using you package manager of choice.

Peer dependencies that your project should contain:
 - [@nestjs/common](https://www.npmjs.com/package/@nestjs/common) `^10.2.7`,
 - [RxJS](https://www.npmjs.com/package/rxjs) `^7.8.1`

> Some features have **additional installation requirements**, please refer to the feature documentation for more information.

## Contents

### Decorators
- [Log](./src/decorator/log/log-decorator.md) - method call logging
- [Histogram Metric](./src/decorator/histogram-metric/histogram-metric-decorator.md) - Prometheus histogram metrics

### Distributed Locking

Create lock decorators bound to **any injectable** `LockServiceInterface` via NestJS DI:

```ts
const { SequentialLock, ExclusiveLock } = createPromiseLockDecorators(MyLockService, 5000);
const { SequentialLock$, ExclusiveLock$ } = createObservableLockDecorators(MyLockService, 5000);
```

- [createPromiseLockDecorators](./src/decorator/lock/create-promise-lock-decorators/create-promise-lock-decorators.md) - `SequentialLock` + `ExclusiveLock` for async methods
- [createObservableLockDecorators](./src/decorator/lock/create-observable-lock-decorators/create-observable-lock-decorators.md) - `SequentialLock$` + `ExclusiveLock$` for Observable methods

### Deprecated

- [LockPromise](./src/decorator/lock/lock-promise/lock-promise-decorator.md) - use `createPromiseLockDecorators` instead
- [LockObservable](./src/decorator/lock/lock-observable/lock-observable-decorator.md) - use `createObservableLockDecorators` instead
- [LockableService](./src/decorator/lock/lock-decorator.md) - use `LockServiceInterface` instead

## License

This library is licensed under The [MIT License](./LICENSE.md).
