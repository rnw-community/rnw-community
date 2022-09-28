import { isDefined } from '@rnw-community/shared';

export const findEnumRootSelector = <T>(selectors: T): string | undefined => {
    const selectorKeys = Object.keys(selectors);

    const rootSelectorKey = selectorKeys.find(key => key === 'Root');

    // @ts-expect-error Improve typing
    return isDefined(rootSelectorKey) ? (selectors[rootSelectorKey] as unknown as string) : undefined;
};
