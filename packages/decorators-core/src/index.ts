export type { ExecutionContextInterface } from './interface/execution-context.interface';
export type { InterceptorInterface } from './interface/interceptor.interface';
export type { ResultStrategyInterface } from './interface/result-strategy.interface';
export type { GetResultType } from './type/get-result.type';

export type { CreateInterceptorOptionsInterface } from './interface/create-interceptor-options.interface';

export { createInterceptor } from './engine/create-interceptor/create-interceptor';

export { syncStrategy } from './strategy/sync-strategy/sync.strategy';
export { promiseStrategy } from './strategy/promise-strategy/promise.strategy';
