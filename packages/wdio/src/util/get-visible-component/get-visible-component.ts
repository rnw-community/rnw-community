import { isDefined } from '@rnw-community/shared';

import { VisibleComponent } from '../../component';

// TODO: Improve typings with Enum, improve ts errors?

// @ts-expect-error We ignore prefix, how we can avoid TS error?
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SelectorMethods<T extends string, S extends string> = T extends `${infer Prefix}.${infer Selector}`
    ? Selector extends `Root`
        ? never
        : `${Selector}${S}`
    : never;

type VisibleComponentWithSelectors<T extends string> = VisibleComponent & {
    [TKey in SelectorMethods<T, 'ClickByIdx'>]: (idx: number) => ReturnType<WebdriverIO.Element['click']>;
} & {
    [TKey in SelectorMethods<T, 'El'>]: Promise<WebdriverIO.Element>;
} & {
    [TKey in SelectorMethods<T, 'Els'>]: Promise<WebdriverIO.ElementArray>;
} & {
    [TKey in SelectorMethods<T, 'Exists'>]: ReturnType<WebdriverIO.Element['isExisting']>;
} & {
    [TKey in SelectorMethods<T, 'IsDisplayed'>]: ReturnType<WebdriverIO.Element['isDisplayed']>;
} & {
    [TKey in SelectorMethods<T, 'Text'>]: ReturnType<WebdriverIO.Element['getText']>;
} & {
    [TKey in SelectorMethods<T, 'WaitForDisplayed'>]: ReturnType<WebdriverIO.Element['waitForDisplayed']>;
} & {
    [TKey in SelectorMethods<T, 'WaitForExists'>]: ReturnType<WebdriverIO.Element['waitForExist']>;
} & { [TKey in SelectorMethods<T, 'Click'>]: ReturnType<WebdriverIO.Element['click']> };

type VisibleComponentWithSelectorsCtor<T extends string> = new (
    selectorOrElement?: WebdriverIO.Element | string
) => VisibleComponentWithSelectors<T>;

export const getVisibleComponent = <T extends string, E = unknown>(selectors: E): VisibleComponentWithSelectorsCtor<T> =>
    // @ts-expect-error We use proxy for dynamic fields
    class extends VisibleComponent {
        constructor(selectorOrElement?: WebdriverIO.Element | string) {
            const selectorKeys = Object.keys(selectors).sort((s1, s2) => s1.length - s2.length) as T[];
            // @ts-expect-error We need better enum types
            const selectorRootKey = selectors[selectorKeys.find(key => key === 'Root')] as string;

            const rootSelector = isDefined(selectorOrElement) ? selectorOrElement : selectorRootKey;

            if (!isDefined(rootSelector)) {
                throw new Error('Cannot create VisibleComponent - No Root element selector was passed');
            }

            super(rootSelector);

            // eslint-disable-next-line no-constructor-return
            return new Proxy(this, {
                // eslint-disable-next-line max-statements
                get(proxyClient, field: T, receiver) {
                    if (field in proxyClient) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                        return Reflect.get(proxyClient, field, receiver);
                    }

                    // TODO: This logic need improvement to avoid false positives
                    const selectorKey = selectorKeys.find(key => field.includes(key));

                    if (isDefined(selectorKey)) {
                        if (field.endsWith('WaitForDisplayed')) {
                            // @ts-expect-error We need to fix types of the enum
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            return proxyClient.waitForDisplayedChildEl(selectors[selectorKey]);
                        } else if (field.endsWith('WaitForExists')) {
                            // @ts-expect-error We need to fix types of the enum
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            return proxyClient.waitForExistsChildEl(selectors[selectorKey]);
                        } else if (field.endsWith('ClickByIdx')) {
                            // @ts-expect-error We need to fix types of the enum
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            return (idx: number) => proxyClient.clickByIdxChildEl(selectors[selectorKey], idx);
                        } else if (field.endsWith('Click')) {
                            // @ts-expect-error We need to fix types of the enum
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            return proxyClient.clickChildEl(selectors[selectorKey]);
                        } else if (field.endsWith('Text')) {
                            // @ts-expect-error We need to fix types of the enum
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            return proxyClient.getTextChildEl(selectors[selectorKey]);
                        } else if (field.endsWith('IsDisplayed')) {
                            // @ts-expect-error We need to fix types of the enum
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            return proxyClient.isDisplayedChildEl(selectors[selectorKey]);
                        } else if (field.endsWith('Exists')) {
                            // @ts-expect-error We need to fix types of the enum
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            return proxyClient.isExistingChildEl(selectors[selectorKey]);
                        } else if (field.endsWith('Els')) {
                            // @ts-expect-error We need to fix types of the enum
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            return proxyClient.getChildEls(selectors[selectorKey]);
                        } else if (field.endsWith('El')) {
                            // @ts-expect-error We need to fix types of the enum
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            return proxyClient.getChildEl(selectors[selectorKey]);
                        }
                    }

                    return undefined;
                },
            });
        }
    };
