import { Component } from '../../component/component';
import { default$ComponentConfig } from '../../config/default$-component.config';

import type { ComponentWithSelectorsCtor } from '../../type';
import type { ClassType } from '@rnw-community/shared';

/**
 * Returns a raw-selector component class that falls back to a parent component class's selectors and members.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#getcomponent
 */
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
