import { defaultComponentConfig } from '../../default-component.config';

import type { ComponentConfigInterface, ComponentWithSelectorsCtor } from '../../type';
import type { Component } from '../component';
import type { ClassType, Enum } from '@rnw-community/shared';

export const getExtendedComponent = <T extends string, P extends Component>(
    selectors: Enum<T>,
    ParentComponent: ClassType<P>,
    config: ComponentConfigInterface = defaultComponentConfig
): ComponentWithSelectorsCtor<T, P> =>
    // @ts-expect-error We use proxy for dynamic fields
    class extends ParentComponent {
        constructor(innerConfig = config, innerSelectors = selectors) {
            super(innerConfig, innerSelectors);

            this.selectors = { ...selectors, ...this.selectors };
        }
    };
