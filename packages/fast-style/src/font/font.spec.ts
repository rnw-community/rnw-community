import { getFont } from './font';

import type { TextStyle } from 'react-native';

enum TestFontFamilyEnum {
    Family1 = 'Family1',
    Family2 = 'Family2',
}

enum TestFontSizeEnum {
    Size1 = '1',
    Size2 = '2',
}

enum TestFontColorEnum {
    Color1 = 'Color1',
    Color2 = 'Color2',
}

const expectedTree = {
    Family1: {
        Size1: {
            Color1: {
                color: 'Color1',
                fontFamily: 'Family1',
                fontSize: 1,
            },
            Color2: {
                color: 'Color2',
                fontFamily: 'Family1',
                fontSize: 1,
            },
        },
        Size2: {
            Color1: {
                color: 'Color1',
                fontFamily: 'Family1',
                fontSize: 2,
            },
            Color2: {
                color: 'Color2',
                fontFamily: 'Family1',
                fontSize: 2,
            },
        },
    },
    Family2: {
        Size1: {
            Color1: {
                color: 'Color1',
                fontFamily: 'Family2',
                fontSize: 1,
            },
            Color2: {
                color: 'Color2',
                fontFamily: 'Family2',
                fontSize: 1,
            },
        },
        Size2: {
            Color1: {
                color: 'Color1',
                fontFamily: 'Family2',
                fontSize: 2,
            },
            Color2: {
                color: 'Color2',
                fontFamily: 'Family2',
                fontSize: 2,
            },
        },
    },
};

enum TestFontSizeNumericEnum {
    TestFontSizeNumericEnum1 = 0,
    TestFontSizeNumericEnum2 = 2,
}

const additionalStyleMock: TextStyle = {
    textAlignVertical: 'center',
    includeFontPadding: false,
};

const expectedExtendedTree = {
    Family1: {
        Size1: {
            Color1: {
                color: 'Color1',
                fontFamily: 'Family1',
                fontSize: 1,
                textAlignVertical: 'center',
                includeFontPadding: false,
            },
            Color2: {
                color: 'Color2',
                fontFamily: 'Family1',
                fontSize: 1,
                textAlignVertical: 'center',
                includeFontPadding: false,
            },
        },
        Size2: {
            Color1: {
                color: 'Color1',
                fontFamily: 'Family1',
                fontSize: 2,
                textAlignVertical: 'center',
                includeFontPadding: false,
            },
            Color2: {
                color: 'Color2',
                fontFamily: 'Family1',
                fontSize: 2,
                textAlignVertical: 'center',
                includeFontPadding: false,
            },
        },
    },
    Family2: {
        Size1: {
            Color1: {
                color: 'Color1',
                fontFamily: 'Family2',
                fontSize: 1,
                textAlignVertical: 'center',
                includeFontPadding: false,
            },
            Color2: {
                color: 'Color2',
                fontFamily: 'Family2',
                fontSize: 1,
                textAlignVertical: 'center',
                includeFontPadding: false,
            },
        },
        Size2: {
            Color1: {
                color: 'Color1',
                fontFamily: 'Family2',
                fontSize: 2,
                textAlignVertical: 'center',
                includeFontPadding: false,
            },
            Color2: {
                color: 'Color2',
                fontFamily: 'Family2',
                fontSize: 2,
                textAlignVertical: 'center',
                includeFontPadding: false,
            },
        },
    },
};

describe('getFont', () => {
    it('should create a tree for mocked font family, size and color', () => {
        expect.hasAssertions();

        const Font = getFont(TestFontFamilyEnum, TestFontSizeEnum, TestFontColorEnum);
        expect(Font).toStrictEqual(expectedTree);
    });

    it('should throw an error if size enum has numeric values', () => {
        expect.hasAssertions();

        const getFontError = (): ReturnType<typeof getFont> =>
            getFont(TestFontFamilyEnum, TestFontSizeNumericEnum, TestFontColorEnum);
        expect(getFontError).toThrow('fontSizeObj must have string values');
    });

    it('should add additional styles', () => {
        expect.hasAssertions();

        const Font = getFont(TestFontFamilyEnum, TestFontSizeEnum, TestFontColorEnum, additionalStyleMock);
        expect(Font).toStrictEqual(expectedExtendedTree);
    });
});
