export type { ExecutionContextInterface } from './type/execution-context.interface';
export type { InterceptorInterface } from './type/interceptor.interface';
export type { ResultStrategyInterface } from './type/result-strategy.interface';

export type { CreateInterceptorOptionsInterface } from './engine/create-interceptor/create-interceptor-options.interface';
export type { CreateLegacyInterceptorOptionsInterface } from './engine/create-legacy-interceptor/create-legacy-interceptor-options.interface';
export type { LegacyMethodDecoratorType } from './engine/create-legacy-interceptor/legacy-method-decorator.type';

export { createInterceptor } from './engine/create-interceptor/create-interceptor';
export { createLegacyInterceptor } from './engine/create-legacy-interceptor/create-legacy-interceptor';

export { promiseStrategy } from './strategy/promise-strategy/promise.strategy';
