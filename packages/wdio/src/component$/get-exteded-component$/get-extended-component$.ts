import { Component } from '../../component/component';
import { default$ComponentConfig } from '../../config/default$-component.config';

import type { ComponentWithSelectorsCtor } from '../../type';
import type { ClassType, Enum } from '@rnw-community/shared';

export const getExtendedComponent$ = <T, P extends Component>(
    selectors: T,
    ParentComponent: ClassType<P>
): ComponentWithSelectorsCtor<T, P> =>
    // @ts-expect-error We use proxy for dynamic fields
    class extends Component<T> {
        constructor() {
            super(default$ComponentConfig(), selectors as unknown as Enum<T>);

            if (ParentComponent !== Component) {
                this.addParentComponent(new ParentComponent());
            }
        }
    };
