import { isDefined } from '@rnw-community/shared';

import type { Enum } from '@rnw-community/shared';

export const findEnumRootSelector = <T>(selectors: Enum<T>): string | undefined => {
    const selectorKeys = Object.keys(selectors);

    const rootSelectorKey = selectorKeys.find(key => key === 'Root');

    return isDefined(rootSelectorKey) ? (selectors[rootSelectorKey] as unknown as string) : undefined;
};
