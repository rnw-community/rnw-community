import { Component } from '../../component/component.js';
import { default$ComponentConfig } from '../../config/default$-component.config.js';

import type { ComponentWithSelectorsCtor } from '../../type/index.js';
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
