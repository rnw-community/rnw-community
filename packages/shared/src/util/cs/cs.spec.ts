import { describe, expect, it } from '@jest/globals';

import { cs } from './cs';

describe('cs', () => {
    const trueStyle = { backgroundColor: 'green' };
    const falseStyle = { backgroundColor: 'red' };

    it('should return trueStyle if condition is true', () => {
        expect.hasAssertions();
        expect(cs(true, trueStyle, falseStyle)).toStrictEqual(trueStyle);
    });

    it('should return falseStyle if condition is false', () => {
        expect.hasAssertions();
        expect(cs(false, trueStyle, falseStyle)).toStrictEqual(falseStyle);
    });

    it('should return trueStyle if condition is true and falseStyle not passed', () => {
        expect.hasAssertions();
        expect(cs(true, trueStyle)).toStrictEqual(trueStyle);
    });

    it('should return empty object if condition is false and falseStyle not passed', () => {
        expect.hasAssertions();
        expect(cs(false, trueStyle)).toStrictEqual({});
    });
});
