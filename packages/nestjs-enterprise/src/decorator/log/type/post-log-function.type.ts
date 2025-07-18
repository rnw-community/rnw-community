// eslint-disable-next-line @typescript-eslint/max-params
export type PostLogFunction<T, TArgs extends unknown[]> = (
    result: T,
    arg1: TArgs[0],
    arg2: TArgs[1],
    arg3: TArgs[2],
    arg4: TArgs[3],
    arg5: TArgs[4]
) => string;
