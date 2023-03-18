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

export const DynamicComponent: = ({ testID = 'ParentTestID' }:IOSTestIDProps) => (
    <Text {...setTestId(testID, `Text`)}>Text</Text>
);
```

Which will generate `ParentTestID_Text`;

### getTestID

### setPropTestID

Setting _testID_ similar to `setTestID` but with overriding default _testID_.

```tsx
import React from 'react';
import { Text } from 'react-native';
import { TestIDProps } from '@rnw-community/wdio';

interface Props extends TestIDProps, React.PropsWithChildren {
    testID?: string;
}

const defaultTestID = 'DynamicComponent.Root';

export const DynamicComponent = ({children, ...props}:Props) => (
    <View {...setPropTestID(defaultTestID, props)}>
        {children}
    </View>);
```

## Commands

### Setup
#### copy 2 d.ts files into root of your e2e project

* [wdio.d.ts](https://github.com/rnw-community/rnw-community/blob/9294a867193951b8f37310ef0f7092c74f6b87f2/packages/wdio/src/wdio.d.ts)
* [webdriverio.d.ts](https://github.com/rnw-community/rnw-community/blob/9294a867193951b8f37310ef0f7092c74f6b87f2/packages/wdio/src/wevdriverio.d.ts)

#### add wdio.config.js to your e2e project

```ts
import { addWdioCommands } from '@rnw-community/wdio';

export const wdioBaseConfiguration = (): WebdriverIO.Config => ({
  //...your config
  before(_capabilities, _specs, browser: WebdriverIO.Browser) {
    addWdioCommands(browser);
  },
});

```
### Usage

#### openDeepLink

No more manually open safary, locate address and enter link with unicode enter in the end

```ts
import driver from '@wdio/globals';

describe('DeepLink', () => {
    it('should open deep link', async () => {
        await driver.openDeepLink('myapp://products/1234');
    });
});
```

#### testID$ and testID$$

`testID$` and `testID$$` are the same as `$` and `$$` but with support for testID selector

```ts
import driver from '@wdio/globals';

describe('DynamicComponent', () => {
    it('should find component', async () => {
        await expect(driver.testID$('DynamicComponent.Root')).toBeDisplayed();
    });
});
```

#### testID$$Index

`testID$$Index` is the same as `$$` but with support for testID selector and index. Returns element by index

```ts
import driver from '@wdio/globals';

describe('DynamicComponent', () => {
    it('should find root element', async () => {
        await expect(driver.testID$$Index('DynamicComponent.Root', 0)).toBeDisplayed();
    });
});
```
#### slowInput

`slowInput` is the same as `setValue` but with support for typing speed

```ts
import driver from '@wdio/globals';
import { FormSelectors } from 'my-react-native-project/src/form.selectors';

describe('Form', () => {
    it('should input test slowly', async () => {
        await driver.testID$(FormSelectors.Input).slowInput('test', 100);
    });
});
```

#### clearInput

`clearInput` does several things:
-   clearValue which usually doesn't work
-   setValue('') which usually doesn't work either
-   gets text and deletes it character by character

```ts
import driver from '@wdio/globals';
import { FormSelectors } from 'my-react-native-project/src/form.selectors';

describe('Form', () => {
    it('should clear input', async () => {
        await driver.testID$(FormSelectors.Input).clearInput();
    });
});
```

#### relativeClick

`relativeClick` clicks on element relative to it's size in percents

```ts
import driver from '@wdio/globals';
import { FormSelectors } from 'my-react-native-project/src/form.selectors';

describe('Form', () => {
    it('should click on the center of the element', async () => {
        await driver.testID$(FormSelectors.Button).relativeClick(50, 50);
    });
});
```


## Components

### createComponent

`createComponent` is a helper function to create wdio components with testID support

```ts
import { createComponent } from '@rnw-community/wdio';
import { CardSelectors } from 'my-react-native-project/src/card.selectors';

describe('Card', () => {
    it('should find component', async () => {
        const card = createComponent(CardSelectors);
        const cards = await card.els();
        await expect(cards).toHaveLength(3);

        const lastCard = await card.byIdx(2);
        await expect(lastCard.Root).toBeDisplayed();
        await expect(lastCard.Text).toHaveText('Card 3');
        await lastCard.CloseButton.click();
        await expect(card.els()).resolves.toHaveLength(2);
    });
});
```

### getComponent

`getComponent` is a helper function to get wdio component class with testID support

#### card.component.ts
```ts
import { getComponent } from '@rnw-community/wdio';
import { CardSelectors } from 'my-react-native-project/src/card.selectors';

export class Card extends getComponent(CardSelectors) {
    public async close() {
        await this.CloseButton.click();
    }
}
```
#### card.spec.ts
```ts
import { Card } from './card.component';

describe('Card', () => {
    it('should find component', async () => {
        const card = new Card();
        const cards = await card.els();
        await expect(cards).toHaveLength(3);

        const lastCard = await card.byIdx(2);
        await expect(lastCard.Root).toBeDisplayed();
        await expect(lastCard.Text).toHaveText('Card 3');
        // no need to use lastCard.CloseButton.click();
        await lastCard.close();
        await expect(card.els()).resolves.toHaveLength(2);
    });
});
```

### createRootedComponent

`createRootedComponent` is a helper function to create wdio components with testID support and root element

```ts
import { createRootedComponent } from '@rnw-community/wdio';
import { CardSelectors } from 'my-react-native-project/src/card.selectors';

describe('Card', () => {
    it('should find component', async () => {
        const card = createRootedComponent(CardSelectors);
        const cards = await card.els();
        await expect(cards).toHaveLength(3);

        const lastCard = await card.byIdx(2);
        // no need to use lastCard.Root because it's already in the Card class
        await expect(lastCard).toBeDisplayed();
        await expect(lastCard.Text).toHaveText('Card 3');
        await lastCard.CloseButton.click();
        await expect(card.els()).resolves.toHaveLength(2);
    });
});
```
#### card.spec.ts
```ts
import { Card } from './card.component';

describe('Card', () => {
    it('should find component', async () => {
        const card = new Card();
        const cards = await card.els();
        await expect(cards).toHaveLength(3);

        const lastCard = await card.byIdx(2);
        await expect(lastCard.Root).toBeDisplayed();
        await expect(lastCard.Text).toHaveText('Card 3');
        // no need to use lastCard.CloseButton.click();
        await lastCard.close();
        await expect(card.els()).resolves.toHaveLength(2);
    });
});
```


### getRootedComponent

`getRootedComponent` is a helper function to get wdio component class with testID support and root element

#### card.component.ts
```ts
import { getRootedComponent } from '@rnw-community/wdio';
import { CardSelectors } from 'my-react-native-project/src/card.selectors';

export class Card extends getRootedComponent(CardSelectors) {
    public async close() {
        await this.CloseButton.click();
    }
}
```
#### card.spec.ts
```ts
import { Card } from './card.component';

describe('Card', () => {
    it('should find component', async () => {
        const card = new Card();
        const cards = await card.els();
        await expect(cards).toHaveLength(3);

        const lastCard = await card.byIdx(2);
        // no need to use lastCard.Root because it's already in the Card class
        await expect(lastCard).toBeDisplayed();
        await expect(lastCard.Text).toHaveText('Card 3');
        // no need to use lastCard.CloseButton.click();
        await lastCard.close();
        await expect(card.els()).resolves.toHaveLength(2);
    });
});
```
## Recommendations

### Create Selectors enum for each component close to the component file

#### card.selectors.ts
```tsx
export enum CardSelectors {
    Root = 'Root',
    Text = 'Text',
}
```

#### card.tsx
```tsx 
import { CardSelectors as Selectors } from './card.selectors';
export const Card = () => (
    <View {...setTestID(CardSelectors.Root)}>
        <Text {...setTestID(CardSelectors.Text)}>Text</Text>
    </View>
);
```
### Export all selectors from your project in selectors.ts file in your src folder

#### selectors.ts
```tsx
export * from './card/card.selectors';
```

