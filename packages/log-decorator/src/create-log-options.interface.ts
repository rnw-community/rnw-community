import type { LogTransportInterface } from './log-transport.interface';
import type { SanitizerFnType } from './sanitizer-fn.type';
import type { ResultStrategyInterface } from '@rnw-community/decorators-core';

export interface CreateLogOptionsInterface {
    readonly transport: LogTransportInterface;
    readonly sanitizer?: SanitizerFnType;
    readonly strategies?: readonly ResultStrategyInterface[];
    readonly measureDuration?: boolean;
}
