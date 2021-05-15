import { Flex } from './flex';

const expectedCenter = (flexDirection: string): Record<string, unknown> => ({
    center: {
        baseline: {
            alignItems: 'baseline',
            flexDirection,
            justifyContent: 'center',
        },
        center: {
            alignItems: 'center',
            flexDirection,
            justifyContent: 'center',
        },
        flexEnd: {
            alignItems: 'flex-end',
            flexDirection,
            justifyContent: 'center',
        },
        flexStart: {
            alignItems: 'flex-start',
            flexDirection,
            justifyContent: 'center',
        },
        stretch: {
            alignItems: 'stretch',
            flexDirection,
            justifyContent: 'center',
        },
    },
});

const expectedFlexEnd = (flexDirection: string): Record<string, unknown> => ({
    flexEnd: {
        baseline: {
            alignItems: 'baseline',
            flexDirection,
            justifyContent: 'flex-end',
        },
        center: {
            alignItems: 'center',
            flexDirection,
            justifyContent: 'flex-end',
        },
        flexEnd: {
            alignItems: 'flex-end',
            flexDirection,
            justifyContent: 'flex-end',
        },
        flexStart: {
            alignItems: 'flex-start',
            flexDirection,
            justifyContent: 'flex-end',
        },
        stretch: {
            alignItems: 'stretch',
            flexDirection,
            justifyContent: 'flex-end',
        },
    },
});

const expectedFlexStart = (flexDirection: string): Record<string, unknown> => ({
    flexStart: {
        baseline: {
            alignItems: 'baseline',
            flexDirection,
            justifyContent: 'flex-start',
        },
        center: {
            alignItems: 'center',
            flexDirection,
            justifyContent: 'flex-start',
        },
        flexEnd: {
            alignItems: 'flex-end',
            flexDirection,
            justifyContent: 'flex-start',
        },
        flexStart: {
            alignItems: 'flex-start',
            flexDirection,
            justifyContent: 'flex-start',
        },
        stretch: {
            alignItems: 'stretch',
            flexDirection,
            justifyContent: 'flex-start',
        },
    },
});

const expectedSpaceAround = (flexDirection: string): Record<string, unknown> => ({
    spaceAround: {
        baseline: {
            alignItems: 'baseline',
            flexDirection,
            justifyContent: 'space-around',
        },
        center: {
            alignItems: 'center',
            flexDirection,
            justifyContent: 'space-around',
        },
        flexEnd: {
            alignItems: 'flex-end',
            flexDirection,
            justifyContent: 'space-around',
        },
        flexStart: {
            alignItems: 'flex-start',
            flexDirection,
            justifyContent: 'space-around',
        },
        stretch: {
            alignItems: 'stretch',
            flexDirection,
            justifyContent: 'space-around',
        },
    },
});

const expectedSpaceBetween = (flexDirection: string): Record<string, unknown> => ({
    spaceBetween: {
        baseline: {
            alignItems: 'baseline',
            flexDirection,
            justifyContent: 'space-between',
        },
        center: {
            alignItems: 'center',
            flexDirection,
            justifyContent: 'space-between',
        },
        flexEnd: {
            alignItems: 'flex-end',
            flexDirection,
            justifyContent: 'space-between',
        },
        flexStart: {
            alignItems: 'flex-start',
            flexDirection,
            justifyContent: 'space-between',
        },
        stretch: {
            alignItems: 'stretch',
            flexDirection,
            justifyContent: 'space-between',
        },
    },
});

const expectedSpaceEvenly = (flexDirection: string): Record<string, unknown> => ({
    spaceEvenly: {
        baseline: {
            alignItems: 'baseline',
            flexDirection,
            justifyContent: 'space-evenly',
        },
        center: {
            alignItems: 'center',
            flexDirection,
            justifyContent: 'space-evenly',
        },
        flexEnd: {
            alignItems: 'flex-end',
            flexDirection,
            justifyContent: 'space-evenly',
        },
        flexStart: {
            alignItems: 'flex-start',
            flexDirection,
            justifyContent: 'space-evenly',
        },
        stretch: {
            alignItems: 'stretch',
            flexDirection,
            justifyContent: 'space-evenly',
        },
    },
});

const expectedMainAxis = (flexDirection: string): Record<string, unknown> => ({
    ...expectedCenter(flexDirection),
    ...expectedFlexEnd(flexDirection),
    ...expectedFlexStart(flexDirection),
    ...expectedSpaceAround(flexDirection),
    ...expectedSpaceBetween(flexDirection),
    ...expectedSpaceEvenly(flexDirection),
});

describe('flex', () => {
    it('should has all of the options for Flex direction, alignItems and justifyContent', () => {
        expect.hasAssertions();

        expect(Flex).toStrictEqual({
            column: expectedMainAxis('column'),
            columnReverse: expectedMainAxis('column-reverse'),
            row: expectedMainAxis('row'),
            rowReverse: expectedMainAxis('row-reverse'),
        });
    });
});
