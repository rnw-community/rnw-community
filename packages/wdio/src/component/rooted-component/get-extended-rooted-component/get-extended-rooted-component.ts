import { defaultComponentConfig } from '../../default-component.config';
import { findEnumRootSelector } from '../../util';
import { RootedComponent } from '../rooted-component';

import type { ComponentConfigInterface, ComponentInputArg, RootedComponentWithSelectorsCtor } from '../../type';
import type { ClassType } from '@rnw-community/shared';

export const getExtendedRootedComponent = <T, P extends RootedComponent>(
    selectors: T,
    ParentComponent: ClassType<P>,
    config: ComponentConfigInterface = defaultComponentConfig
): RootedComponentWithSelectorsCtor<T, P> =>
    // @ts-expect-error We use proxy for dynamic fields
    class extends RootedComponent {
        constructor(selectorOrElement: ComponentInputArg | undefined = findEnumRootSelector(selectors)) {
            super(config, selectors, selectorOrElement);

            if (ParentComponent !== RootedComponent) {
                this.addParentComponent(new ParentComponent(selectorOrElement));
            }
        }
    };
