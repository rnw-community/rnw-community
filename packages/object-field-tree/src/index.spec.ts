import { combine } from './index';

enum TestEnum1 {
    TestEnum1Key1 = 'TestEnum1_Value1',
    TestEnum1Key2 = 'TestEnum1_Value2',
    TestEnum1Key3 = 'TestEnum1_Value3',
}

enum TestEnum2 {
    TestEnum2Key1 = 'TestEnum2_Value1',
    TestEnum2Key2 = 'TestEnum2_Value2',
    TestEnum2Key3 = 'TestEnum2_Value3',
}

enum TestEnum3 {
    TestEnum3Key1 = 'TestEnum3_Value1',
    TestEnum3Key2 = 'TestEnum3_Value2',
    TestEnum3Key3 = 'TestEnum3_Value3',
}

enum TestEnum4 {
    TestEnum4Key1 = 'TestEnum4_Value1',
    TestEnum4Key2 = 'TestEnum4_Value2',
    TestEnum4Key3 = 'TestEnum4_Value3',
}

enum TestNumericEnum1 {
    TestNumericEnum1One = 1,
    TestNumericEnum1Two = 2,
}
enum TestNumericEnum2 {
    TestNumericEnum2One = 1,
    TestNumericEnum2Two = 2,
}

const expectedNumericObj1 = {
    '1': {
        '1': {
            '0': '1',
            '1': '1',
        },
        '2': {
            '0': '1',
            '1': '2',
        },
        TestNumericEnum2One: {
            '0': '1',
            '1': 'TestNumericEnum2One',
        },
        TestNumericEnum2Two: {
            '0': '1',
            '1': 'TestNumericEnum2Two',
        },
    },
    '2': {
        '1': {
            '0': '2',
            '1': '1',
        },
        '2': {
            '0': '2',
            '1': '2',
        },
        TestNumericEnum2One: {
            '0': '2',
            '1': 'TestNumericEnum2One',
        },
        TestNumericEnum2Two: {
            '0': '2',
            '1': 'TestNumericEnum2Two',
        },
    },
    TestNumericEnum1One: {
        '1': {
            '0': 'TestNumericEnum1One',
            '1': '1',
        },
        '2': {
            '0': 'TestNumericEnum1One',
            '1': '2',
        },
        TestNumericEnum2One: {
            '0': 'TestNumericEnum1One',
            '1': 'TestNumericEnum2One',
        },
        TestNumericEnum2Two: {
            '0': 'TestNumericEnum1One',
            '1': 'TestNumericEnum2Two',
        },
    },
    TestNumericEnum1Two: {
        '1': {
            '0': 'TestNumericEnum1Two',
            '1': '1',
        },
        '2': {
            '0': 'TestNumericEnum1Two',
            '1': '2',
        },
        TestNumericEnum2One: {
            '0': 'TestNumericEnum1Two',
            '1': 'TestNumericEnum2One',
        },
        TestNumericEnum2Two: {
            '0': 'TestNumericEnum1Two',
            '1': 'TestNumericEnum2Two',
        },
    },
};

const testObj1 = {
    obj1_key1: 'obj1_val1',
    obj1_key2: 'obj1_val2',
};

const testObj2 = {
    obj2_key1: 'obj2_val1',
    obj2_key2: 'obj2_val2',
};

describe('combine', () => {
    const getCombinationsCount = (...objects: Array<Record<string, unknown>>): number =>
        objects.reduce((acc, obj) => Object.keys(obj).length * acc, 1);
    const dataFnMock = jest.fn((...args) => ({ ...args }));

    // eslint-disable-next-line jest/no-hooks
    beforeEach(() => dataFnMock.mockClear());

    it('should create tree from one enum with data generated callback', () => {
        expect.hasAssertions();

        const result = combine(dataFnMock, TestEnum1);

        expect(dataFnMock).toHaveBeenCalledTimes(getCombinationsCount(TestEnum1));

        // Check generated tree structure
        Object.keys(TestEnum1).forEach(enumKey => void expect(result).toHaveProperty(enumKey));

        // Check passed data to final tree node
        expect(result.TestEnum1Key1).toStrictEqual({
            0: 'TestEnum1Key1',
        });
    });

    it('should create tree from four enums with data generated callback', () => {
        expect.hasAssertions();

        const result = combine(dataFnMock, TestEnum1, TestEnum2, TestEnum3, TestEnum4);

        expect(dataFnMock).toHaveBeenCalledTimes(getCombinationsCount(TestEnum1, TestEnum2, TestEnum3, TestEnum4));

        // Check generated tree structure
        Object.keys(TestEnum4).forEach(
            enumKey => void expect(result.TestEnum1Key1.TestEnum2Key1.TestEnum3Key3).toHaveProperty(enumKey)
        );

        // Check passed data to final tree node
        expect(result.TestEnum1Key1.TestEnum2Key1.TestEnum3Key1.TestEnum4Key1).toStrictEqual({
            0: 'TestEnum1Key1',
            1: 'TestEnum2Key1',
            2: 'TestEnum3Key1',
            3: 'TestEnum4Key1',
        });
    });

    it('should create tree from two objects with data generated callback', () => {
        expect.hasAssertions();

        const result = combine(dataFnMock, testObj1, testObj2);

        expect(dataFnMock).toHaveBeenCalledTimes(getCombinationsCount(testObj1, testObj2));

        // Check generated tree structure
        Object.keys(testObj2).forEach(enumKey => void expect(result.obj1_key1).toHaveProperty(enumKey));

        // Check passed data to final tree node
        expect(result.obj1_key1.obj2_key1).toStrictEqual({
            0: 'obj1_key1',
            1: 'obj2_key1',
        });
    });

    it('should create tree from 2 numeric enums and use both their keys and values', () => {
        expect.hasAssertions();

        const result = combine(dataFnMock, TestNumericEnum1, TestNumericEnum2);
        expect(result).toStrictEqual(expectedNumericObj1);
    });
});
