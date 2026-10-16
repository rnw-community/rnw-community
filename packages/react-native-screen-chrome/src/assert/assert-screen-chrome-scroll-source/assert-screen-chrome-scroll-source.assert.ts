import { isDefined } from '@rnw-community/shared';

import type { SharedValue } from 'react-native-reanimated';

export const assertScreenChromeScrollSource = (
    snapToCollapse: boolean,
    externalScrollY: SharedValue<number> | undefined
): void => {
    if (snapToCollapse && isDefined(externalScrollY)) {
        throw new Error(
            'ScreenChromeProvider snapToCollapse scrolls the provider-owned scrollable, so it cannot combine with an external scrollY'
        );
    }
};
