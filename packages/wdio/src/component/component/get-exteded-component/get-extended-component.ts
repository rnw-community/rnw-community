import { defaultComponentConfig } from '../../default-component.config';
import { Component } from '../component';

import type { ComponentConfigInterface, ComponentWithSelectorsCtor } from '../../type';
import type { ClassType } from '@rnw-community/shared';

export const getExtendedComponent = <T, P extends Component>(
    selectors: T,
    ParentComponent: ClassType<P>,
    config: ComponentConfigInterface = defaultComponentConfig()
): ComponentWithSelectorsCtor<T, P> =>
    // @ts-expect-error We use proxy for dynamic fields
    class extends Component {
        constructor() {
            super(config, selectors);

            if (ParentComponent !== Component) {
                this.addParentComponent(new ParentComponent());
            }
        }
    };
