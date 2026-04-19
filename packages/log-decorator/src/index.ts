export type { LogTransportInterface } from './interface/log-transport-interface/log-transport.interface';
export type { CreateLogOptionsInterface } from './interface/create-log-options-interface/create-log-options.interface';

export type { PreLogInputType } from './type/pre-log-input-type/pre-log-input.type';
export type { PostLogInputType } from './type/post-log-input-type/post-log-input.type';
export type { ErrorLogInputType } from './type/error-log-input-type/error-log-input.type';
export type { SanitizerFnType } from './type/sanitizer-fn-type/sanitizer-fn.type';

export { consoleTransport } from './transport/console-transport/console-transport';

export { defaultSanitizer } from './util/default-sanitizer/default-sanitizer';

export { createLog } from './factory/create-log/create-log';
export { createLegacyLog } from './factory/create-legacy-log/create-legacy-log';
