import { Component } from '../component/component';

import type { ComponentWithSelectors, Enum } from '../../type';

type ComponentWithSelectorsCtor<T extends string> = new (
    selectorOrElement?: WebdriverIO.Element | string
) => ComponentWithSelectors<T, Component>;

export const getComponent = <T extends string>(selectors: Enum<T>): ComponentWithSelectorsCtor<T> =>
    // @ts-expect-error We use proxy for dynamic fields
    class extends Component {
        constructor() {
            super();

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
