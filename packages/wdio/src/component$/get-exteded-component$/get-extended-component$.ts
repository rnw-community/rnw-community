import { Component } from '../../component/component';
import { default$ComponentConfig } from '../../config/default$-component.config';

import type { ComponentWithSelectorsCtor } from '../../type';
import type { ClassType } from '@rnw-community/shared';

export const getExtendedComponent$ = <T, P extends Component>(
    selectors: T,
    ParentComponent: ClassType<P>
): ComponentWithSelectorsCtor<T, P> =>
    // @ts-expect-error proxy resolves fields dynamically
    class extends Component<T> {
        constructor() {
            super(default$ComponentConfig(), selectors);

            if (ParentComponent !== Component) {
                this.addParentComponent(new ParentComponent());
            }
        }
    };
