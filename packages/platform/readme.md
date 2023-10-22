# Platform - React native web community

Platform specific helpers and utils for react native web.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fredux-loadable.svg)](https://badge.fury.io/js/%40rnw-community%2Fredux-loadable)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fredux-loadable.svg)](https://www.npmjs.com/package/%40rnw-community%2Fredux-loadable)

### Platform constants

Global constants for simple identifying of the platform:

-   `isWeb`
-   `isIOS`
-   `isAndroid`
-   `isMobile` - IOS or Android

### Platform styling

Simple platform-specific styling helpers:

-   `webStyles(style)`
-   `androidStyles(style)`
-   `iosStyles(style)`
-   `iosStyles(style)`
-   `mobileStyles(style)`

Example usage:

```ts
import { StyleSheet } from 'react-native';
import { webStyles, androidStyles } from '@rnw-community/shared';

export const Styles = StyleSheet.create({
    root: {
        width: 200,
        ...webStyles({
            width: 400,
        }),
        ...androidStyles({
            paddingBottom: 5,
        }),
    },
});
```

### getEnv

Generic getter of environment variable value supporting `web` and `native` platforms. Works using [react-native-config](https://github.com/luggit/react-native-config)
on `native` platform, uses node `process` on `web` platform.

Example usage:

```ts
import { getEnv } from '@rnw-community/platform';

const myEnvVar = getEnv('ENV_NAME');
```

## License

This library is licensed under The [MIT License](./LICENSE.md).
