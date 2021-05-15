import { emptyFn } from './empty-fn';

describe('emptyFn', () => {
    it('should not return anything without arguments', () => {
        // tslint:disable-next-line no-use-of-empty-return-value
        expect(emptyFn()).toEqual(undefined);
    });
    it('should not return anything with arguments', () => {
        // tslint:disable-next-line no-use-of-empty-return-value
        expect(emptyFn(1, 2, 3)).toEqual(undefined);
    });
});
