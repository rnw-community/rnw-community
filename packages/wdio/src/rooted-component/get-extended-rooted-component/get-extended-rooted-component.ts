import { defaultComponentConfig } from '../../config/default-component.config';
import { RootedComponent } from '../rooted-component';

import type { ComponentInputArg, RootedComponentWithSelectorsCtor } from '../../type';
import type { ClassType } from '@rnw-community/shared';

export const getExtendedRootedComponent = <T, P extends RootedComponent>(
    selectors: T,
    ParentComponent: ClassType<P>
): RootedComponentWithSelectorsCtor<T, P> =>
    // @ts-expect-error We use proxy for dynamic fields
    class extends RootedComponent {
        constructor(selectorOrElement: ComponentInputArg) {
            super(defaultComponentConfig(), selectors, selectorOrElement);

            if (ParentComponent !== RootedComponent) {
                this.addParentComponent(new ParentComponent(selectorOrElement));
            }
        }
    };
