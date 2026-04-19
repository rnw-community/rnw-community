export type { ExecutionContextInterface } from './type/execution-context.interface';
export type { InterceptorInterface } from './type/interceptor.interface';
export type { ResultStrategyInterface } from './type/result-strategy.interface';
export type { AnyMethodType } from './type/any-method.type';

export type {
    CreateInterceptorOptionsInterface,
} from './engine/create-interceptor';
export type {
    CreateLegacyInterceptorOptionsInterface,
    LegacyMethodDecoratorType,
} from './engine/create-legacy-interceptor';

export { createInterceptor } from './engine/create-interceptor';
export { createLegacyInterceptor } from './engine/create-legacy-interceptor';

export { promiseStrategy } from './strategy/promise.strategy';

export { now } from './util/now';
export { isPromiseLike } from './util/is-promise';
