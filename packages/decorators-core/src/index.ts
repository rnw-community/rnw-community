export type { ExecutionContextInterface } from './interface/execution-context.interface';
export type { InterceptorInterface } from './interface/interceptor.interface';
export type { ResultStrategyInterface } from './interface/result-strategy.interface';
export type { MethodDecoratorType } from './type/method-decorator.type';

export type { CreateInterceptorOptionsInterface } from './interface/create-interceptor-options.interface';

export { createInterceptor } from './engine/create-interceptor/create-interceptor';

export { promiseStrategy } from './strategy/promise-strategy/promise.strategy';
export { observableStrategy } from './strategy/observable-strategy/observable.strategy';
