export type ExclusiveLockArgumentType<TArgs extends readonly unknown[]> =
    | string
    | ((args: TArgs) => string)
    | {
          readonly key: string | ((args: TArgs) => string);
      };
