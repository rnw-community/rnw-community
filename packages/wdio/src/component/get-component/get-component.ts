import { defaultComponentConfig } from '../../config/default-component.config';
import { Component } from '../component';
import { getExtendedComponent } from '../get-exteded-component/get-extended-component';

import type { ComponentConfigInterface, ComponentWithSelectorsCtor } from '../../type';

export const getComponent = <T>(
    selectors: T,
    config: ComponentConfigInterface = defaultComponentConfig()
): ComponentWithSelectorsCtor<T> => getExtendedComponent(selectors, Component, config);
