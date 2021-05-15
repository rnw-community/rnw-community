import { emptyFn } from './empty-fn';

describe('emptyFn', () => {
    it('should not return anything without arguments', () => {
        expect(emptyFn()).toEqual(undefined);
    });
    it('should not return anything with arguments', () => {
        expect(emptyFn(1, 2, 3)).toEqual(undefined);
    });
});
