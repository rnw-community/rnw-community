import { TextStyle } from 'react-native';

import { getFont } from './font';

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
    TestFontSizeNumericEnum1,
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

describe('GetFont', () => {
    it('Should create a tree for mocked font family, size and color', () => {
        const Font = getFont(TestFontFamilyEnum, TestFontSizeEnum, TestFontColorEnum);
        expect(Font).toEqual(expectedTree);
    });
    it('Should throw an error if size enum has numeric values', () => {
        const getFontError = () => getFont(TestFontFamilyEnum, TestFontSizeNumericEnum, TestFontColorEnum);
        expect(getFontError).toThrowError('fontSizeObj must have string values');
    });
    it('Should add additional styles', () => {
        const Font = getFont(TestFontFamilyEnum, TestFontSizeEnum, TestFontColorEnum, additionalStyleMock);
        expect(Font).toEqual(expectedExtendedTree);
    });
});
