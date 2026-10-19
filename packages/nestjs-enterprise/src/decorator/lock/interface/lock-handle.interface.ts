/**
 * The handle returned by a `LockServiceInterface` acquisition, released automatically once the decorated method settles.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-enterprise/readme.md#types
 */
export interface LockHandle {
    /** Releases the acquired resources. */
    release(): Promise<void>;
}
