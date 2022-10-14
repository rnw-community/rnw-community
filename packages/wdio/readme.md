# WDIO commands and utils

WDIO commands and utils.

## TODO

-   Refactor tests to mock MockElement(rename to MockElementPromise), use it instead of mockElement object
-   Rename all tests `its` properly after API stabilizes
-   Write docs with the examples
-   Add tests for extended class instance ctor return from async function - it resolves to WDIO element =)

## Installation

Install additional peer dependencies:

-   [webdriverio](https://github.com/webdriverio/webdriverio)

## Usage

## Utils

### setTestID

Setting _testID_ for each platform can produce warning, `setTestID(...ids)` fixes it and has support for dynamically
generated components.

Example usage:

```tsx
import React, { FC } from 'react';
import { Text } from 'react-native';

import { IOSTestIDProps, setTestId } from '@rnw-community/wdio';

export const DynamicComponent: FC<IOSTestIDProps> = ({ testID = 'ParentTestID' }) => (
    <Text {...setTestId(testID, `Text`)}>Text</Text>
);
```

Which will generate `ParentTestID_Text`;

### getTestID

### setPropTestID
