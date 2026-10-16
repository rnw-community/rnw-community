import { defaultComponentConfig } from '../../config/default-component.config';
import { Component } from '../component';

import type { ComponentWithSelectorsCtor } from '../../type';
import type { ClassType } from '@rnw-community/shared';

/**
 * Returns a testID-based component class for a selectors enum that falls back to a parent component class's selectors and members.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#getcomponent
 */
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
