import type { ExecutionContextInterface } from '../type/execution-context.interface';

/* istanbul ignore next -- globalThis is guaranteed present in all supported runtimes */
const globalRef: unknown = typeof globalThis === 'undefined' ? undefined : globalThis;

export const buildContext = <TArgs extends readonly unknown[]>(
    self: unknown,
    fallbackClassName: string,
    methodName: string,
    args: TArgs
): ExecutionContextInterface<TArgs> => {
    const isAttached =
        self !== null &&
        self !== undefined &&
        self !== globalRef &&
        typeof (self as { readonly constructor?: { readonly name?: string } }).constructor?.name === 'string' &&
        (self as { readonly constructor: { readonly name: string } }).constructor.name.length > 0;

    const resolvedClassName = isAttached
        ? (self as { readonly constructor: { readonly name: string } }).constructor.name
        : fallbackClassName;

    return {
        className: resolvedClassName,
        methodName,
        args,
        logContext: `${resolvedClassName}::${methodName}`,
    };
};
