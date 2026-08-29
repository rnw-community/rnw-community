import { describe, expect, it } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../constant/screen-chrome-default-config.constant';

import { getCollapsibleHeaderMotion } from './get-collapsible-header-motion.util';

const OFFSET_COLLAPSE_START = 20;
const OFFSET_SMALL_TITLE_START = 40;
const OFFSET_LARGE_TITLE_END = 80;
const OFFSET_COLLAPSE_END = 120;

describe('getCollapsibleHeaderMotion', () => {
    it('maps default title thresholds to normalized progress', () => {
        expect.hasAssertions();

        expect(getCollapsibleHeaderMotion(SCREEN_CHROME_DEFAULT_CONFIG)).toEqual({
            expandedOpacityEndProgress: 0.75,
            collapsedOpacityStartProgress: 0.5,
            backgroundOpacityStartProgress: 1,
            expandedTranslateY: 0,
            expandedScale: 1,
            collapsedTranslateY: 0,
        });
    });

    it('normalizes thresholds against a collapse interval that does not start at zero', () => {
        expect.hasAssertions();

        const motion = getCollapsibleHeaderMotion({
            ...SCREEN_CHROME_DEFAULT_CONFIG,
            collapseStart: OFFSET_COLLAPSE_START,
            smallTitleStart: OFFSET_SMALL_TITLE_START,
            largeTitleEnd: OFFSET_LARGE_TITLE_END,
            collapseEnd: OFFSET_COLLAPSE_END,
        });

        expect(motion.collapsedOpacityStartProgress).toBe(0.2);
        expect(motion.expandedOpacityEndProgress).toBe(0.6);
    });

    it('leaves the pointer-event and accessibility switch to the derived cross-fade midpoint', () => {
        expect.hasAssertions();

        expect(getCollapsibleHeaderMotion(SCREEN_CHROME_DEFAULT_CONFIG)).not.toHaveProperty('pointerEventsSwitchProgress');
    });

    it('keeps title layers free of endpoint translation and scaling', () => {
        expect.hasAssertions();

        const motion = getCollapsibleHeaderMotion(SCREEN_CHROME_DEFAULT_CONFIG);

        expect(motion.expandedTranslateY).toBe(0);
        expect(motion.collapsedTranslateY).toBe(0);
        expect(motion.expandedScale).toBe(1);
    });
});
