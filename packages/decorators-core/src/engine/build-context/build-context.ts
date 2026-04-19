import { isDefined } from '@rnw-community/shared';

import type { ExecutionContextInterface } from '../../type/execution-context-interface/execution-context.interface';

const resolveNameFromFunction = (self: Function): string | undefined => {
    const name = (self as { readonly name?: string }).name;
    return typeof name === 'string' && name.length > 0 ? name : undefined;
};

const resolveNameFromConstructor = (self: object): string | undefined => {
    const ctorName = (self as { readonly constructor?: { readonly name?: string } }).constructor?.name;
    return typeof ctorName === 'string' && ctorName.length > 0 ? ctorName : undefined;
};

const getAttachedName = (self: unknown): string | undefined => {
    if (!isDefined(self) || self === globalThis) {
        return undefined;
    }

    if (typeof self === 'function') {
        return resolveNameFromFunction(self);
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
