import { proxyCall } from '../../util';
import { Component } from '../component';

import type { Enum } from '../../../type';
import type { ComponentWithSelectorsCtor } from '../../type';
import type { ComponentConfigInterface } from '../../type/component-config-arg.type';

export const getComponent = <T extends string>(
    selectors: Enum<T>,
    config?: ComponentConfigInterface
): ComponentWithSelectorsCtor<T> =>
    // @ts-expect-error We use proxy for dynamic fields
    class extends Component {
        constructor() {
            super(config);

            // eslint-disable-next-line no-constructor-return
            return new Proxy(this, {
                get(client, field: T, receiver) {
                    if (field in client) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                        return Reflect.get(client, field, receiver);
                    }

                    return proxyCall(client, selectors, field);
                },
            });
        }
    };
