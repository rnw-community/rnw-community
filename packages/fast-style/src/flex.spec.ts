/* tslint:disable:no-duplicate-string */
import { Flex } from './flex';

const expectedFlex = {
    column: {
        center: {
            baseline: {
                alignItems: 'baseline',
                flexDirection: 'column',
                justifyContent: 'center',
            },
            center: {
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
            },
            flexEnd: {
                alignItems: 'flex-end',
                flexDirection: 'column',
                justifyContent: 'center',
            },
            flexStart: {
                alignItems: 'flex-start',
                flexDirection: 'column',
                justifyContent: 'center',
            },
            stretch: {
                alignItems: 'stretch',
                flexDirection: 'column',
                justifyContent: 'center',
            },
        },
        flexEnd: {
            baseline: {
                alignItems: 'baseline',
                flexDirection: 'column',
                justifyContent: 'flex-end',
            },
            center: {
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'flex-end',
            },
            flexEnd: {
                alignItems: 'flex-end',
                flexDirection: 'column',
                justifyContent: 'flex-end',
            },
            flexStart: {
                alignItems: 'flex-start',
                flexDirection: 'column',
                justifyContent: 'flex-end',
            },
            stretch: {
                alignItems: 'stretch',
                flexDirection: 'column',
                justifyContent: 'flex-end',
            },
        },
        flexStart: {
            baseline: {
                alignItems: 'baseline',
                flexDirection: 'column',
                justifyContent: 'flex-start',
            },
            center: {
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'flex-start',
            },
            flexEnd: {
                alignItems: 'flex-end',
                flexDirection: 'column',
                justifyContent: 'flex-start',
            },
            flexStart: {
                alignItems: 'flex-start',
                flexDirection: 'column',
                justifyContent: 'flex-start',
            },
            stretch: {
                alignItems: 'stretch',
                flexDirection: 'column',
                justifyContent: 'flex-start',
            },
        },
        spaceAround: {
            baseline: {
                alignItems: 'baseline',
                flexDirection: 'column',
                justifyContent: 'space-around',
            },
            center: {
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'space-around',
            },
            flexEnd: {
                alignItems: 'flex-end',
                flexDirection: 'column',
                justifyContent: 'space-around',
            },
            flexStart: {
                alignItems: 'flex-start',
                flexDirection: 'column',
                justifyContent: 'space-around',
            },
            stretch: {
                alignItems: 'stretch',
                flexDirection: 'column',
                justifyContent: 'space-around',
            },
        },
        spaceBetween: {
            baseline: {
                alignItems: 'baseline',
                flexDirection: 'column',
                justifyContent: 'space-between',
            },
            center: {
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'space-between',
            },
            flexEnd: {
                alignItems: 'flex-end',
                flexDirection: 'column',
                justifyContent: 'space-between',
            },
            flexStart: {
                alignItems: 'flex-start',
                flexDirection: 'column',
                justifyContent: 'space-between',
            },
            stretch: {
                alignItems: 'stretch',
                flexDirection: 'column',
                justifyContent: 'space-between',
            },
        },
        spaceEvenly: {
            baseline: {
                alignItems: 'baseline',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
            },
            center: {
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
            },
            flexEnd: {
                alignItems: 'flex-end',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
            },
            flexStart: {
                alignItems: 'flex-start',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
            },
            stretch: {
                alignItems: 'stretch',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
            },
        },
    },
    row: {
        center: {
            baseline: {
                alignItems: 'baseline',
                flexDirection: 'row',
                justifyContent: 'center',
            },
            center: {
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
            },
            flexEnd: {
                alignItems: 'flex-end',
                flexDirection: 'row',
                justifyContent: 'center',
            },
            flexStart: {
                alignItems: 'flex-start',
                flexDirection: 'row',
                justifyContent: 'center',
            },
            stretch: {
                alignItems: 'stretch',
                flexDirection: 'row',
                justifyContent: 'center',
            },
        },
        flexEnd: {
            baseline: {
                alignItems: 'baseline',
                flexDirection: 'row',
                justifyContent: 'flex-end',
            },
            center: {
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'flex-end',
            },
            flexEnd: {
                alignItems: 'flex-end',
                flexDirection: 'row',
                justifyContent: 'flex-end',
            },
            flexStart: {
                alignItems: 'flex-start',
                flexDirection: 'row',
                justifyContent: 'flex-end',
            },
            stretch: {
                alignItems: 'stretch',
                flexDirection: 'row',
                justifyContent: 'flex-end',
            },
        },
        flexStart: {
            baseline: {
                alignItems: 'baseline',
                flexDirection: 'row',
                justifyContent: 'flex-start',
            },
            center: {
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'flex-start',
            },
            flexEnd: {
                alignItems: 'flex-end',
                flexDirection: 'row',
                justifyContent: 'flex-start',
            },
            flexStart: {
                alignItems: 'flex-start',
                flexDirection: 'row',
                justifyContent: 'flex-start',
            },
            stretch: {
                alignItems: 'stretch',
                flexDirection: 'row',
                justifyContent: 'flex-start',
            },
        },
        spaceAround: {
            baseline: {
                alignItems: 'baseline',
                flexDirection: 'row',
                justifyContent: 'space-around',
            },
            center: {
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-around',
            },
            flexEnd: {
                alignItems: 'flex-end',
                flexDirection: 'row',
                justifyContent: 'space-around',
            },
            flexStart: {
                alignItems: 'flex-start',
                flexDirection: 'row',
                justifyContent: 'space-around',
            },
            stretch: {
                alignItems: 'stretch',
                flexDirection: 'row',
                justifyContent: 'space-around',
            },
        },
        spaceBetween: {
            baseline: {
                alignItems: 'baseline',
                flexDirection: 'row',
                justifyContent: 'space-between',
            },
            center: {
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
            },
            flexEnd: {
                alignItems: 'flex-end',
                flexDirection: 'row',
                justifyContent: 'space-between',
            },
            flexStart: {
                alignItems: 'flex-start',
                flexDirection: 'row',
                justifyContent: 'space-between',
            },
            stretch: {
                alignItems: 'stretch',
                flexDirection: 'row',
                justifyContent: 'space-between',
            },
        },
        spaceEvenly: {
            baseline: {
                alignItems: 'baseline',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
            },
            center: {
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
            },
            flexEnd: {
                alignItems: 'flex-end',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
            },
            flexStart: {
                alignItems: 'flex-start',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
            },
            stretch: {
                alignItems: 'stretch',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
            },
        },
    },
};
describe('Flex', () => {
    it('Should has all of the options for Flex direction, alignItems and justifyContent', () => {
        expect(Flex).toEqual(expectedFlex);
    });
});
