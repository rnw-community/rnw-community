import { isDefined } from '@rnw-community/shared';

import { RootedComponent } from '../rooted-component/rooted-component';

import type { ComponentWithSelectors, Enum } from '../../type';

type RootedComponentWithSelectorsCtor<T extends string> = new (
    selectorOrElement?: WebdriverIO.Element | string
) => ComponentWithSelectors<T>;

export const getRootedComponent = <T extends string>(selectors: Enum<T>): RootedComponentWithSelectorsCtor<T> =>
    // @ts-expect-error We use proxy for dynamic fields
    class extends RootedComponent {
        constructor(selectorOrElement: WebdriverIO.Element | string) {
            const selectorKeys = Object.keys(selectors) as T[];

            const rootSelectorKey = selectorKeys.find(key => key === 'Root');
            const selectorRootKey = isDefined(rootSelectorKey) ? selectors[rootSelectorKey] : undefined;
            const rootSelector = isDefined(selectorOrElement) ? selectorOrElement : selectorRootKey;

            if (!isDefined(rootSelector)) {
                throw new Error('Cannot create RootedVisibleComponent - Neither root selector not root element is passed');
            }

            super(rootSelector);

            // eslint-disable-next-line no-constructor-return
            return new Proxy(this, {
                get(client, field: T, receiver) {
                    if (field in client) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                        return Reflect.get(client, field, receiver);
                    }

                    return client.callDynamicMethod(selectors, field);
                },
            });
        }
    };
