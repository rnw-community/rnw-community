import type { RequestOptionsInterface } from './request-options.interface.js';
import type { RequestOptionToggleType } from '../type/request-option-toggle.type.js';
import type { OnEventFn } from '@rnw-community/shared';

export interface RequestOptionsStateInterface {
    options: RequestOptionsInterface;
    setTotalValue: OnEventFn<string>;
    toggleOption: OnEventFn<RequestOptionToggleType>;
}
