import type { ErrorCtor } from './error-ctor.type.js';

export type CreateErrorFn = (msg: string) => Error;

export const defaultCreateError =
     
    (ErrorCtor: ErrorCtor): CreateErrorFn =>
        msg =>
            new ErrorCtor(msg);
