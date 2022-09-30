# WDIO commands and utils

WDIO commands and utils.

## TODO

-   Add unit tests, increase coverage

## Installation

Install additional peer dependencies:

-   [webdriverio](https://github.com/webdriverio/webdriverio)

## Usage

### VisibleComponent

Page/Component object which provides root element behaviour and helpers for working with nested elements.

#### getVisibleComponent

#### createVisibleComponent

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
