import type { ResultStrategyInterface } from '@rnw-community/decorators-core';

import type { LogTransportInterface } from '../log-transport-interface/log-transport.interface';
import type { SanitizerFnType } from '../../type/sanitizer-fn-type/sanitizer-fn.type';

export interface CreateLogOptionsInterface {
    readonly transport: LogTransportInterface;
    readonly sanitizer?: SanitizerFnType;
    readonly strategies?: readonly ResultStrategyInterface[];
    readonly measureDuration?: boolean;
}
