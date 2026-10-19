import type { EmptyFn } from '../../type/empty-fn-type/empty-fn.type';

/**
 * The canonical no-op function, for default callback props and deliberately ignored callback slots.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/util/empty-fn/empty-fn.md
 */
export const emptyFn: EmptyFn = () => void 0;
