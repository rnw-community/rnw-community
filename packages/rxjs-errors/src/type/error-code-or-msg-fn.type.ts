export type ErrorCodeOrMsgFn<TInput> = string | ((val: TInput) => string);
