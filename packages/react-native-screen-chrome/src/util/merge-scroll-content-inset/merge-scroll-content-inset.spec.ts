import { describe, expect, it } from '@jest/globals';
import { StyleSheet } from 'react-native';

import { mergeScrollContentInset } from './merge-scroll-content-inset.util';

import type { EdgeInsets } from 'react-native-safe-area-context';

const INSETS: EdgeInsets = {
    top: 10,
    right: 20,
    bottom: 30,
    left: 40,
};
const CONTENT_INSET_TOP = 5;
const CONTENT_INSET_BOTTOM = 7;
const CONSUMER_PADDING_TOP = 99;
const CONSUMER_PADDING_BOTTOM = 101;

describe('mergeScrollContentInset', () => {
    it('adds safe-area edges and custom top and bottom insets', () => {
        expect.hasAssertions();

        const style = mergeScrollContentInset(INSETS, CONTENT_INSET_TOP, CONTENT_INSET_BOTTOM, null);

        expect(StyleSheet.flatten(style)).toEqual({
            paddingTop: INSETS.top + CONTENT_INSET_TOP,
            paddingRight: INSETS.right,
            paddingBottom: INSETS.bottom + CONTENT_INSET_BOTTOM,
            paddingLeft: INSETS.left,
        });
    });

    it('keeps consumer styles after generated padding so explicit padding wins', () => {
        expect.hasAssertions();

        const style = mergeScrollContentInset(INSETS, CONTENT_INSET_TOP, CONTENT_INSET_BOTTOM, {
            paddingTop: CONSUMER_PADDING_TOP,
            paddingBottom: CONSUMER_PADDING_BOTTOM,
        });

        expect(StyleSheet.flatten(style)).toMatchObject({
            paddingTop: CONSUMER_PADDING_TOP,
            paddingBottom: CONSUMER_PADDING_BOTTOM,
        });
    });

    it('preserves arrays of consumer styles after generated padding', () => {
        expect.hasAssertions();

        const style = mergeScrollContentInset(INSETS, CONTENT_INSET_TOP, CONTENT_INSET_BOTTOM, [
            { gap: 4 },
            { paddingTop: CONSUMER_PADDING_TOP },
        ]);

        expect(StyleSheet.flatten(style)).toMatchObject({
            gap: 4,
            paddingTop: CONSUMER_PADDING_TOP,
            paddingRight: INSETS.right,
            paddingBottom: INSETS.bottom + CONTENT_INSET_BOTTOM,
            paddingLeft: INSETS.left,
        });
    });
});
