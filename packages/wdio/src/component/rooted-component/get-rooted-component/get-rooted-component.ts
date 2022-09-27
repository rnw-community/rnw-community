import { defaultComponentConfig } from '../../default-component.config';
import { getExtendedRootedComponent } from '../get-extended-rooted-component/get-extended-rooted-component';
import { RootedComponent } from '../rooted-component';

import type { ComponentConfigInterface, RootedComponentWithSelectorsCtor } from '../../type';

export const getRootedComponent = <T>(
    selectors: T,
    config: ComponentConfigInterface = defaultComponentConfig
): RootedComponentWithSelectorsCtor<T> => getExtendedRootedComponent(selectors, RootedComponent, config);
