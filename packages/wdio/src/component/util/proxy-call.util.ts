import { isDefined } from '@rnw-community/shared';

import type { Enum } from '../../type';
import type { Component } from '../component/component';
import type { ClickArgs, SetValueArgs, WaitForDisplayedArgs, WaitForEnabledArgs, WaitForExistArgs } from '../type';

export const proxyCall = <E extends string, T extends Component>(client: T, selectors: Enum<E>, field: string): unknown => {
    const selectorValue = selectors[field];

    if (!isDefined(selectorValue)) {
        return undefined;
    }

    return {
        el: () => client.getChildEl(selectorValue),
        els: () => client.getChildEls(selectorValue),
        byIdx: (idx: number) => client.getChildElByIdx(selectorValue, idx),
        waitForDisplayed: (...args: WaitForDisplayedArgs) => client.waitForDisplayedChildEl(selectorValue, ...args),
        waitForExist: (...args: WaitForExistArgs) => client.waitForExistChildEl(selectorValue, ...args),
        waitForEnabled: (...args: WaitForEnabledArgs) => client.waitForEnabledChildEl(selectorValue, ...args),
        setValue: (...args: SetValueArgs) => client.setValueChildEl(selectorValue, ...args),
        click: (...args: ClickArgs) => client.clickChildEl(selectorValue, ...args),
        clickByIdx: (idx: number, ...args: ClickArgs) => client.clickByIdxChildEl(selectorValue, idx, ...args),
        getText: () => client.getTextChildEl(selectorValue),
        isDisplayed: () => client.isDisplayedChildEl(selectorValue),
        isExisting: () => client.isExistingChildEl(selectorValue),
        getLocation: () => client.getLocationChildEl(selectorValue),
        getSize: () => client.getSizeChildEl(selectorValue),
    };
};
