export type LockArgumentType<TArgs extends readonly unknown[]> =
    | string
    | ((args: TArgs) => string)
    | {
          readonly key: string | ((args: TArgs) => string);
          readonly timeoutMs?: number;
      };
