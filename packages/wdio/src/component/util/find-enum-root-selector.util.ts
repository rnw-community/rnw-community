import { isDefined } from '@rnw-community/shared';

import type { Enum } from '../../type';

export const findEnumRootSelector = <T extends string>(selectors: Enum<T>): string | undefined => {
    const selectorKeys = Object.keys(selectors) as T[];

    const rootSelectorKey = selectorKeys.find(key => key === 'Root');

    return isDefined(rootSelectorKey) ? selectors[rootSelectorKey] : undefined;
};
