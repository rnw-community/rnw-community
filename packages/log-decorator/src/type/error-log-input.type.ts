/**
 * The message logged when the decorated method fails, either a static string or a builder receiving the error followed by the method arguments.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/log-decorator/readme.md#errorloginputtypetargs
 */
export type ErrorLogInputType<TArgs extends readonly unknown[]> =
    | string
    | ((error: unknown, ...args: TArgs) => string);
