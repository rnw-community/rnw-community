import type { ErrorCtor } from './error-ctor.type';

export type CreateErrorFn = (msg: string) => Error;

export const defaultCreateError =
    // eslint-disable-next-line @typescript-eslint/naming-convention
    (ErrorCtor: ErrorCtor): CreateErrorFn =>
        msg =>
            new ErrorCtor(msg);
