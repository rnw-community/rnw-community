export type SequentialLockArgumentType<TArgs extends readonly unknown[]> =
    | string
    | ((args: TArgs) => string)
    | {
          readonly key: string | ((args: TArgs) => string);
          readonly timeoutMs?: number;
          readonly signal?: AbortSignal;
      };
