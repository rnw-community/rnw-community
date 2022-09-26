import { byIndex$$ } from '../../../command';
import { getRootedComponent } from '../get-rooted-component/get-rooted-component';

export const get$RootedComponent: typeof getRootedComponent = selectors =>
    getRootedComponent(selectors, {
        elSelectorFn: $,
        elsSelectorFn: $$,
        elsIndexSelectorFn: byIndex$$,
    });
