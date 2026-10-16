/**
 * The locking semantics a store applies to a key, either FIFO-queued `'sequential'` or skip-on-busy `'exclusive'`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/lock-decorator/readme.md#lockmodetype
 */
export type LockModeType = 'sequential' | 'exclusive';
