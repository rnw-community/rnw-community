export type { LogTransportInterface } from './log-transport.interface';
export { consoleTransport } from './console-transport';

export type { PreLogInputType, PostLogInputType, ErrorLogInputType } from './log-input.type';

export type { SanitizerFnType } from './sanitizer';
export { defaultSanitizer } from './sanitizer';

export type { CreateLogOptionsInterface } from './create-log-options.interface';

export { createLog } from './create-log';
export { createLegacyLog } from './create-legacy-log';
