import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BACKGROUNDS, SCHEMES, TEMPORAL_PLAN } from './edge-fade-plan.ts';

describe('edge-fade temporal plan', () => {
    it('labels each recording with the scheme and background its taps selected', () => {
        let scheme = 0;
        let background = 0;
        for (const step of TEMPORAL_PLAN) {
            for (const tap of step.taps) {
                if (tap === 'edge-fade-harness-scheme') {
                    scheme = (scheme + 1) % SCHEMES.length;
                } else {
                    background = (background + 1) % BACKGROUNDS.length;
                }
            }
            assert.equal(step.cell, `${SCHEMES[scheme]}-${BACKGROUNDS[background]}`);
        }
    });

    it('records every scheme and background once, in the metrics order', () => {
        assert.deepEqual(
            TEMPORAL_PLAN.map(step => step.cell),
            ['dark-dark', 'dark-light', 'dark-vivid', 'light-dark', 'light-light', 'light-vivid']
        );
    });
});
