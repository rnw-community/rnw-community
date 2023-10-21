import type { EmptyFn } from '../../type/empty-fn-type/empty-fn.type';

/**
 * Function that has not implementation and returns void.
 *
 * Useful for React nad other event handlers default value to avoid condition checks.
 *
 * @returns void
 */
export const emptyFn: EmptyFn = () => void 0;
