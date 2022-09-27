import { defaultComponentConfig } from '../../default-component.config';

import type { ComponentConfigInterface, ComponentInputArg, RootedComponentWithSelectorsCtor } from '../../type';
import type { RootedComponent } from '../rooted-component';
import type { ClassType, Enum } from '@rnw-community/shared';

export const getExtendedRootedComponent = <T extends string, P extends RootedComponent>(
    selectors: Enum<T>,
    ParentComponent: ClassType<P>,
    config: ComponentConfigInterface = defaultComponentConfig
): RootedComponentWithSelectorsCtor<T, P> =>
    // @ts-expect-error We use proxy for dynamic fields
    class extends ParentComponent {
        constructor(...args: [ComponentConfigInterface, Enum<T>, ComponentInputArg] | [ComponentInputArg]) {
            // HINT: This condition is needed for nested extended creation of rooted components
            if (args.length > 1) {
                super(...args);
            } else {
                super(config, selectors, args[0]);
            }

            this.selectors = { ...selectors, ...this.selectors };
        }
    };
