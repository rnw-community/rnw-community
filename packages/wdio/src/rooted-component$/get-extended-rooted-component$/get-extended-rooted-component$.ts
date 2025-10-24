/* eslint-disable no-implicit-globals */
import { default$ComponentConfig } from '../../config/default$-component.config';
import { RootedComponent } from '../../rooted-component/rooted-component';

import type { ComponentInputArg } from '../../type';
import type {
    RootedComponentCtorWithDefaultRootSelector,
    RootedComponentCtorWithoutDefaultRootSelector,
} from '../../type/rooted-component-with-selectors-ctor.type';
import type { ClassType } from '@rnw-community/shared';

export function getExtendedRootedComponent$<T, P extends RootedComponent>(
    selectors: T,
    ParentComponent: ClassType<P>
): RootedComponentCtorWithoutDefaultRootSelector<T, P>;

export function getExtendedRootedComponent$<T, P extends RootedComponent>(
    selectors: T,
    ParentComponent: ClassType<P>,
    rootSelector: T[keyof T]
): RootedComponentCtorWithDefaultRootSelector<T, P>;

export function getExtendedRootedComponent$<T, P extends RootedComponent>(
    selectors: T,
    ParentComponent: ClassType<P>,
    rootSelector?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
    return class extends RootedComponent {
        constructor(selectorOrElement: ComponentInputArg | undefined = rootSelector) {
            super(default$ComponentConfig(), selectors, selectorOrElement);

            if (ParentComponent !== RootedComponent) {
                this.addParentComponent(new ParentComponent(selectorOrElement));
            }
        }
    };
}
