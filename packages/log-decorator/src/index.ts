export type { LogTransportInterface, CreateLogOptionsInterface, PreLogInputType, PostLogInputType, ErrorLogInputType, SanitizerFnType } from './types';

export { consoleTransport } from './console-transport';
export { defaultSanitizer } from './default-sanitizer';

export { createLog } from './create-log';
export { createLegacyLog } from './create-legacy-log';
