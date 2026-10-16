/**
 * The key argument accepted by the sequential lock decorators, as a static key, a key builder from the method arguments, or an object adding `timeoutMs` and `signal`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/lock-decorator/readme.md#sequentiallockargumenttypetargs
 */
export type SequentialLockArgumentType<TArgs extends readonly unknown[]> =
    | string
    | ((args: TArgs) => string)
    | {
          readonly key: string | ((args: TArgs) => string);
          readonly timeoutMs?: number;
          readonly signal?: AbortSignal;
      };
