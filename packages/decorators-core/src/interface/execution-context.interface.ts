/**
 * The per-invocation identity of a decorated method call, passed as the first argument to every `InterceptorMiddleware`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/decorators-core/readme.md#executioncontextinterfacetargs
 */
export interface ExecutionContextInterface<TArgs extends readonly unknown[] = readonly unknown[]> {
    /** The runtime class name of `this`, falling back to the decorated target's name when `this` is detached. */
    readonly className: string;
    /** The decorated method's property key as a string. */
    readonly methodName: string;
    /** The original arguments the decorated method was invoked with. */
    readonly args: TArgs;
    /** The `ClassName::methodName` label for log and metric transports. */
    readonly logContext: string;
}
