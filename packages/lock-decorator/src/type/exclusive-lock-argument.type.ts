/**
 * The key argument accepted by the exclusive lock decorators, as a static key, a key builder from the method arguments, or a `{ key }` object.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/lock-decorator/readme.md#exclusivelockargumenttypetargs
 */
export type ExclusiveLockArgumentType<TArgs extends readonly unknown[]> =
    | string
    | ((args: TArgs) => string)
    | {
          readonly key: string | ((args: TArgs) => string);
      };
