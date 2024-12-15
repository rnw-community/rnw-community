import { defaultComponentConfig } from '../../config/default-component.config';
import { Component } from '../component';

import type { ComponentWithSelectorsCtor } from '../../type';
import type { ClassType } from '@rnw-community/shared';

export const getExtendedComponent = <T, P extends Component>(
    selectors: T,
    ParentComponent: ClassType<P>
): ComponentWithSelectorsCtor<T, P> =>
    class extends Component<T> {
        constructor() {
            super(defaultComponentConfig(), selectors);

            if (ParentComponent !== Component) {
                this.addParentComponent(new ParentComponent());
            }
        }
    } as ComponentWithSelectorsCtor<T, P>;
