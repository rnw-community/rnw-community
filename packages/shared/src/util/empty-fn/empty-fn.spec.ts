import { describe, expect, it } from '@jest/globals';

import { emptyFn } from './empty-fn';

describe('emptyFn', () => {
    it('should not return anything without arguments', () => {
        expect.hasAssertions();

        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        expect(emptyFn()).toBeUndefined();
    });

    it('should not return anything with arguments', () => {
        expect.hasAssertions();

        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        expect(emptyFn(1, 2, 3)).toBeUndefined();
    });
});
