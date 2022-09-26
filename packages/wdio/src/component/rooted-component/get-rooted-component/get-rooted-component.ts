import { isDefined } from '@rnw-community/shared';

import { defaultComponentConfig } from '../../default-component.config';
import { createComponentWithSelectorsProxy, findEnumRootSelector } from '../../util';
import { RootedComponent } from '../rooted-component';

import type { ComponentConfigInterface, ComponentInputArg, RootedComponentWithSelectorsCtor } from '../../type';
import type { Enum } from '@rnw-community/shared';

export const getRootedComponent = <T extends string>(
    selectors: Enum<T>,
    config: ComponentConfigInterface = defaultComponentConfig
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
            return createComponentWithSelectorsProxy(this, selectors);
        }
    };
