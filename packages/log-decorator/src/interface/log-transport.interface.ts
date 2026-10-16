/**
 * The logging backend the log decorator writes its enter, success, and error messages to.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/log-decorator/readme.md#logtransportinterface
 */
export interface LogTransportInterface {
    /** Receives the `preLog` message emitted before the decorated method runs. */
    readonly log: (message: string, logContext: string) => void;
    /** Receives the `postLog` message emitted after the decorated method succeeds. */
    readonly debug: (message: string, logContext: string) => void;
    /** Receives the `errorLog` message together with the thrown `Error`, or `undefined` when a non-`Error` value was thrown. */
    readonly error: (message: string, error: unknown, logContext: string) => void;
}
