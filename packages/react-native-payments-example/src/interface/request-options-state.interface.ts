import type { RequestOptionsInterface } from './request-options.interface';
import type { RequestOptionToggleType } from '../type/request-option-toggle.type';
import type { OnEventFn } from '@rnw-community/shared';

export interface RequestOptionsStateInterface {
    options: RequestOptionsInterface;
    setTotalValue: OnEventFn<string>;
    toggleOption: OnEventFn<RequestOptionToggleType>;
}
