import { isDefined } from '@rnw-community/shared';

import { VisibleComponent } from '../../component';

import type { VisibleComponentWithSelectorsCtor } from '../../type';

// TODO: Improve typings with Enum, improve ts errors?
export const getVisibleComponent = <T extends string, E = unknown>(selectors: E): VisibleComponentWithSelectorsCtor<T> =>
    // @ts-expect-error We use proxy for dynamic fields
    class extends VisibleComponent {
        constructor(selectorOrElement?: WebdriverIO.Element | string) {
            const selectorKeys = Object.keys(selectors) as T[];
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
                        if (field.endsWith('WaitForEnabled')) {
                            // @ts-expect-error We need to fix types of the enum
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            return (...args) => proxyClient.waitForEnabledChildEl(selectors[selectorKey], args);
                        } else if (field.endsWith('SetValue')) {
                            // @ts-expect-error We need to fix types of the enum
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            return (value: string) => proxyClient.setValueChildEl(selectors[selectorKey], value);
                        } else if (field.endsWith('WaitForDisplayed')) {
                            // @ts-expect-error We need to fix types of the enum
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            return (...args) => proxyClient.waitForDisplayedChildEl(selectors[selectorKey], args);
                        } else if (field.endsWith('WaitForExists')) {
                            // @ts-expect-error We need to fix types of the enum
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            return (...args) => proxyClient.waitForExistsChildEl(selectors[selectorKey], args);
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
