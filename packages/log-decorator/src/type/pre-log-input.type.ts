/**
 * The message logged before the decorated method runs, either a static string or a builder receiving the method arguments.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/log-decorator/readme.md#preloginputtypetargs
 */
export type PreLogInputType<TArgs extends readonly unknown[]> = string | ((...args: TArgs) => string);
