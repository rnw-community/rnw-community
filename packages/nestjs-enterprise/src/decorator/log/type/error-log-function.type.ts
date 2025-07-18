// eslint-disable-next-line @typescript-eslint/max-params
export type ErrorLogFunction<TArgs extends unknown[]> = (
    error: unknown,
    arg1: TArgs[0],
    arg2: TArgs[1],
    arg3: TArgs[2],
    arg4: TArgs[3],
    arg5: TArgs[4]
) => string;
