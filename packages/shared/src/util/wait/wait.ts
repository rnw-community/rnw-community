/**
 * Promise-based sleep that resolves after `ms` milliseconds.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/util/wait/wait.md
 */
export const wait = (ms: number): Promise<void> =>
    new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });
