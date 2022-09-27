import { defaultComponentConfig } from '../../default-component.config';
import { Component } from '../component';
import { getExtendedComponent } from '../get-exteded-component/get-extended-component';

import type { ComponentConfigInterface, ComponentWithSelectorsCtor } from '../../type';
import type { Enum } from '@rnw-community/shared';

export const getComponent = <T extends string>(
    selectors: Enum<T>,
    config: ComponentConfigInterface = defaultComponentConfig
): ComponentWithSelectorsCtor<T> => getExtendedComponent(selectors, Component, config);
