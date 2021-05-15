# Platform - React native web community
Platform specific helpers and utils for react native web.

### Platform constants
Global constants for simple identifying of the platform:
 - `isWeb`
 - `isIOS`
 - `isAndroid`
 - `isMobile` - IOS or Android

### Platform styling
Simple platform-specific styling helpers:
 - `webStyles(style)`
 - `androidStyles(style)`
 - `iosStyles(style)`
 - `mobileStyles(style)`

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
            paddingBottom: 5
        })
    }
});

```

### setTestId
Setting _testID_ for each platform can produce warning, `setTestId(...ids)` fixes it and has support for dynamically
generated components.

Example usage:
```tsx
import React, { FC } from 'react';
import { Text } from 'react-native';

import { setTestId } from '@rnw-community/platform';

interface Props {
    testID: string;
}

export const DynamicComponent: FC<Props> = ({testID = 'ParentTestID'}) => (
    <Text {...setTestId(testID, `Text`)}>Text</Text>
);
```
Which will generate `ParentTestID_Text`;

### Storage
> Deprecated Use @react-native-community/async-storage, it has web fallback support

Generic `async storage` for [redux-persist](https://github.com/rt2zz/redux-persist) configuration supporting
`web` and `native` platforms.

Example usage:
```ts
import { storage } from '@rnw-community/platform';

export const persistConfig = {
    key: 'my-key',
    storage,
};
```

### getEnv
Generic getter of environment variable value supporting `web` and `native` platforms. Works using [react-native-config](https://github.com/luggit/react-native-config)
on `native` platform, uses node `process` on `web` platform.

Example usage:
```ts
import { getEnv } from '@rnw-community/platform';

const myEnvVar = getEnv('ENV_NAME');
```
