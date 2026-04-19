import type { ResultStrategyInterface } from '@rnw-community/decorators-core';

export interface LogTransportInterface {
    readonly log: (message: string, logContext: string) => void;
    readonly debug: (message: string, logContext: string) => void;
    readonly error: (message: string, error: unknown, logContext: string) => void;
}

export type SanitizerFnType = (value: unknown) => unknown;

export interface CreateLogOptionsInterface {
    readonly transport: LogTransportInterface;
    readonly sanitizer?: SanitizerFnType;
    readonly strategies?: readonly ResultStrategyInterface[];
    readonly measureDuration?: boolean;
}

export type PreLogInputType<TArgs extends readonly unknown[]> = string | ((args: TArgs) => string);
export type PostLogInputType<TArgs extends readonly unknown[], TResult> = string | ((result: TResult, args: TArgs) => string);
export type ErrorLogInputType<TArgs extends readonly unknown[]> = string | ((error: unknown, args: TArgs) => string);
