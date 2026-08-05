import { getExtendedRootedComponent } from '../get-extended-rooted-component/get-extended-rooted-component.js';

import { RootedComponentSelectorsMock } from './rooted-component-selectors.mock.js';
import { RootedComponentMock } from './rooted-component.mock.js';

export class DefaultRootRootedExtendedComponentMock extends getExtendedRootedComponent(
    RootedComponentSelectorsMock,
    RootedComponentMock,
    RootedComponentSelectorsMock.Root
) {}
