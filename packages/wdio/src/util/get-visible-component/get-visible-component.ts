import { isDefined } from '@rnw-community/shared';

import { VisibleComponent } from '../../component';

import type {
    SelectorObject,
    SetValueArgs,
    VisibleComponentWithSelectorsCtor,
    WaitForDisplayedArgs,
    WaitForEnabledArgs,
    WaitForExistArgs,
} from '../../type';

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
                get(client, field: T, receiver) {
                    if (field in client) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                        return Reflect.get(client, field, receiver);
                    }

                    // TODO: This logic need improvement to avoid false positives
                    const selectorKey = selectorKeys.find(key => field.includes(key));

                    if (isDefined(selectorKey)) {
                        // @ts-expect-error We need to fix types of the enum
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        const selectorValue = selectors[selectorKey] as string;

                        return client.callDynamicMethod(field, selectorKey, selectorValue);
                    }

                    return undefined;
                },
            });
        }

        protected getSelectorObject(selectorValue: string): SelectorObject {
            return {
                waitForDisplayed: (...args: WaitForDisplayedArgs) => this.waitForDisplayedChildEl(selectorValue, args),
                waitForExist: (...args: WaitForExistArgs) => this.waitForExistsChildEl(selectorValue, args),
                waitForEnabled: (...args: WaitForEnabledArgs) => this.waitForEnabledChildEl(selectorValue, args),
                setValue: (...args: SetValueArgs) => this.setValueChildEl(selectorValue, args),
                click: () => this.clickChildEl(selectorValue),
                clickByIdx: (idx: number) => this.clickByIdxChildEl(selectorValue, idx),
                getText: () => this.getTextChildEl(selectorValue),
                isDisplayed: () => this.isDisplayedChildEl(selectorValue),
                isExisting: () => this.isExistingChildEl(selectorValue),
            };
        }

        // eslint-disable-next-line max-statements
        protected callDynamicMethod(field: string, selectorKey: string, selectorValue: string): unknown {
            const selectorObject = this.getSelectorObject(selectorValue);

            if (field === selectorKey) {
                return selectorObject;
            } else if (field.endsWith('WaitForEnabled')) {
                return selectorObject.waitForEnabled;
            } else if (field.endsWith('SetValue')) {
                return selectorObject.setValue;
            } else if (field.endsWith('WaitForDisplayed')) {
                return selectorObject.waitForDisplayed;
            } else if (field.endsWith('WaitForExists')) {
                return selectorObject.waitForExist;
            } else if (field.endsWith('ClickByIdx')) {
                return selectorObject.clickByIdx;
            } else if (field.endsWith('Click')) {
                return selectorObject.click();
            } else if (field.endsWith('Text')) {
                return selectorObject.getText();
            } else if (field.endsWith('IsDisplayed')) {
                return selectorObject.isDisplayed();
            } else if (field.endsWith('Exists')) {
                return selectorObject.isExisting();
            } else if (field.endsWith('Els')) {
                return this.getChildEls(selectorValue);
            } else if (field.endsWith('El')) {
                return this.getChildEl(selectorValue);
            }

            return undefined;
        }
    };
