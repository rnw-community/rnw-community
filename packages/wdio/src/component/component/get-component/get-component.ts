import { defaultComponentConfig } from '../../default-component.config';
import { createComponentWithSelectorsProxy } from '../../util';
import { Component } from '../component';

import type { Enum } from '../../../type';
import type { ComponentConfigInterface, ComponentWithSelectorsCtor } from '../../type';

export const getComponent = <T extends string>(
    selectors: Enum<T>,
    config: ComponentConfigInterface = defaultComponentConfig
): ComponentWithSelectorsCtor<T> =>
    // @ts-expect-error We use proxy for dynamic fields
    class extends Component {
        constructor() {
            super(config);

            // eslint-disable-next-line no-constructor-return
            return createComponentWithSelectorsProxy(this, selectors);
        }
    };
