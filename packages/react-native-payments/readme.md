# ReactNative Payments

Implementation of [W3C Payment Request API(version 08 September 2022)](https://www.w3.org/TR/payment-request/) for React Native.

This library is a full refactoring of the [react-native-payments](https://github.com/naoufal/react-native-payments):
- fully rewritten in TypeScript, removed deprecated and unsupported code for [W3C Payment Request API](https://www.w3.org/TR/payment-request/)
- unified API for IOS and Android, no more code dependant code when using the lib, unified interfaces/enums.
- updated and refactored and simplified IOS native code, removed all deprecated code
- added all types for IOS ApplePay entities
- removed Stripe/Braintree built-in gateway support, only custom gateways are supported as aforementioned have their own libs.
- ReactNative new architecture support([turbomodules](https://reactnative.dev/docs/the-new-architecture/pillars-turbomodules))

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fnestjs-webpack-swc.svg)](https://badge.fury.io/js/%40rnw-community%2Freact-native-payments)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Freact-native-payments.svg)](https://www.npmjs.com/package/%40rnw-community%2Freact-native-payments)

> Apple pay and Google pay for react-native

## TODO
- [ ] Implement Android implementation
- [ ] Transfer and refactor tests
- [ ] Improve, update and finish the docs, add android examples for custom gateways
- [ ] Add web support
- [ ] Improve and unify errors according to the spec
- [ ] CI/CD:
    - [ ] check/setup pull request
    - [ ] check/setup push to master and release to NPM
    - [ ] add e2e via maestro for IOS
    - [ ] add e2e via maestro for Android
- [ ] Rewrite IOS to swift?
- [x] Add lib.dom and comply with the spec - We do not need it
- [x] Create TurboModule
- [x] Transfer JS and convert to TS
- [x] Implement iOS implementation
- [x] Improve PaymentRequest usage, no index.js changes
- [x] External dependencies:
    - [x] Do we need validator lib? - Yes, for now
    - [x] Do we need uuid lib? - Yes, for now
- [x] Check `package.json` files and react-native config, can we use `dist/esm` for metro?

## Installation

1. Install package `@rnw-community/react-native-payments` using your package manager

## Configuration
