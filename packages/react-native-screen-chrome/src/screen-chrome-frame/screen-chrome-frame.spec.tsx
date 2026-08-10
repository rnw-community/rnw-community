import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';

import { ScreenChromeFrame } from './screen-chrome-frame';

describe('ScreenChromeFrame', () => {
    it('renders a relative full-height frame', () => {
        const screen = render(
            <ScreenChromeFrame testID="frame" style={{ backgroundColor: 'red' }}>
                child
            </ScreenChromeFrame>
        );

        expect(screen.getByTestId('frame')).toHaveStyle({
            flex: 1,
            position: 'relative',
            backgroundColor: 'red',
        });
    });
});
