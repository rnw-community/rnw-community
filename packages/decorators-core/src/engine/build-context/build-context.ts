import { isDefined } from '@rnw-community/shared';

import type { ExecutionContextInterface } from '../../type/execution-context.interface';

const resolveNameFromFunction = (fn: { readonly name?: string }): string | null => {
    const { name } = fn;

    return typeof name === 'string' && name.length > 0 ? name : null;
};

const resolveNameFromConstructor = (self: object): string | null => {
    const ctorName = (self as { readonly constructor?: { readonly name?: string } }).constructor?.name;

    return typeof ctorName === 'string' && ctorName.length > 0 ? ctorName : null;
};

const getAttachedName = (self: unknown): string | null => {
    if (!isDefined(self) || self === globalThis) {
        return null;
    }

    if (typeof self === 'function') {
        return resolveNameFromFunction(self as { readonly name?: string });
    }

    return resolveNameFromConstructor(self as object);
};

export const buildContext = <TArgs extends readonly unknown[]>(
    self: unknown,
    fallbackClassName: string,
    methodName: string,
    args: TArgs
): ExecutionContextInterface<TArgs> => {
    const className = getAttachedName(self) ?? fallbackClassName;

    return {
        className,
        methodName,
        args,
        logContext: `${className}::${methodName}`,
    };
};
