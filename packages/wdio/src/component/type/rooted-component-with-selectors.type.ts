import type { RootedComponent } from '../rooted-component/rooted-component';
import type { SelectorObject } from './selector-object.type';

export type RootedComponentWithSelectors<T> = Omit<Record<keyof T, SelectorObject>, 'Root'> & RootedComponent<T>;
