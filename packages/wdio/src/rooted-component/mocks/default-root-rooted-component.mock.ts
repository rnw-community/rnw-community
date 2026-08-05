import { getRootedComponent } from '../get-rooted-component/get-rooted-component.js';

import { RootedComponentSelectorsMock } from './rooted-component-selectors.mock.js';

export class DefaultRootRootedComponentMock extends getRootedComponent(
    RootedComponentSelectorsMock,
    RootedComponentSelectorsMock.Root
) {}
