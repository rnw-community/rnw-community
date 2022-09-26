import { isDefined } from '@rnw-community/shared';

import { findEnumRootSelector, proxyCall } from '../../util';
import { RootedComponent } from '../rooted-component';

import type { Enum } from '../../../type';
import type { ComponentInputArg, RootedComponentWithSelectors } from '../../type';
import type { ComponentConfigInterface } from '../../type/component-config-arg.type';

type RootedComponentWithSelectorsCtor<T extends string> = new (
    selectorOrElement?: ComponentInputArg
) => RootedComponentWithSelectors<T>;

export const getRootedComponent = <T extends string>(
    selectors: Enum<T>,
    config?: ComponentConfigInterface
): RootedComponentWithSelectorsCtor<T> =>
    // @ts-expect-error We use proxy for dynamic fields
    class extends RootedComponent {
        constructor(selectorOrElement?: ComponentInputArg) {
            const rootSelector = isDefined(selectorOrElement) ? selectorOrElement : findEnumRootSelector(selectors);

            if (!isDefined(rootSelector)) {
                throw new Error('Cannot create RootedComponent - Neither root selector nor root element is passed');
            }

            super(rootSelector, config);

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
