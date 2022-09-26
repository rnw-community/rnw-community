import { byIndex$$ } from '../../../command';
import { getComponent } from '../get-component/get-component';

export const get$Component: typeof getComponent = selectors =>
    getComponent(selectors, { elSelectorFn: $, elsSelectorFn: $$, elsIndexSelectorFn: byIndex$$ });
