export interface ResultStrategyInterface {
    readonly matches: (value: unknown) => boolean;
    readonly handle: <TResult>(
        value: TResult,
        onSuccess: (resolved: unknown) => void,
        onError: (error: unknown) => void
    ) => TResult;
}
