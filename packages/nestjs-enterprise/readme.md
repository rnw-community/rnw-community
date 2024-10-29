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
- [Log Decorator](./src/decorator/log/log-decorator.md)
- [Histogram Metric Decorator](./src/decorator/histogram-metric/histogram-metric-decorator.md)
- [Lock Decorator](./src/decorator/lock/lock-decorator.md)
  - [Lock Promise Decorator](./src/decorator/lock/lock-promise/lock-promise-decorator.md)
  - [Lock Observable Decorator](./src/decorator/lock/lock-observable/lock-observable-decorator.md)

## TODO

-  [ ] Implement single `Lock decorator` that will work for both sync and async methods

## License

This library is licensed under The [MIT License](./LICENSE.md).
