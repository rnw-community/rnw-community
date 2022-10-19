import { getExtendedRootedComponent } from '../get-extended-rooted-component/get-extended-rooted-component';

import { RootedComponentSelectorsMock } from './rooted-component-selectors.mock';
import { RootedComponentMock } from './rooted-component.mock';

export class DefaultRootRootedExtendedComponentMock extends getExtendedRootedComponent(
    RootedComponentSelectorsMock,
    RootedComponentMock,
    RootedComponentSelectorsMock.Root
) {}
