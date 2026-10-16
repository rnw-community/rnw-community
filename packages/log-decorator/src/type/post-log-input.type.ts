/**
 * The message logged after the decorated method succeeds, either a static string or a builder receiving the unwrapped result followed by the method arguments.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/log-decorator/readme.md#postloginputtypetargs-tresult
 */
export type PostLogInputType<TArgs extends readonly unknown[], TResult> =
    | string
    | ((result: TResult, ...args: TArgs) => string);
