import { getRootedComponent } from '../get-rooted-component/get-rooted-component';

import { RootedComponentSelectorsMock } from './rooted-component-selectors.mock';

export class DefaultRootRootedComponentMock extends getRootedComponent(
    RootedComponentSelectorsMock,
    RootedComponentSelectorsMock.Root
) {}
