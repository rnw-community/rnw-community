import type { ResultStrategyInterface } from '@rnw-community/decorators-core';

import type { LogTransportInterface } from './log-transport.interface';
import type { SanitizerFnType } from './sanitizer';

export interface CreateLogOptionsInterface {
    readonly transport: LogTransportInterface;
    readonly sanitizer?: SanitizerFnType;
    readonly devGate?: () => boolean;
    readonly strategies?: readonly ResultStrategyInterface[];
    readonly measureDuration?: boolean;
}
