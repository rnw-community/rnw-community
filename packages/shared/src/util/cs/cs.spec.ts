import { cs } from './cs';

describe('cs', () => {
    const trueStyle = { backgroundColor: 'green' };
    const falseStyle = { backgroundColor: 'red' };

    it('should return trueStyle if condition is true', () => {
        expect(cs(true, trueStyle, falseStyle)).toEqual(trueStyle);
    });
    it('should return falseStyle if condition is false', () => {
        expect(cs(false, trueStyle, falseStyle)).toEqual(falseStyle);
    });
    it('should return trueStyle if condition is true and falseStyle not passed', () => {
        expect(cs(true, trueStyle)).toEqual(trueStyle);
    });
    it('should return empty object if condition is false and falseStyle not passed', () => {
        expect(cs(false, trueStyle)).toEqual({});
    });
});
