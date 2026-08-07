import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';

import { ScreenChromeContent } from './screen-chrome-content.js';

describe('ScreenChromeContent', () => {
    it('renders a full-width flexible content layer', () => {
        const screen = render(
            <ScreenChromeContent testID="content" style={{ backgroundColor: 'blue' }}>
                child
            </ScreenChromeContent>
        );

        expect(screen.getByTestId('content')).toHaveStyle({
            flex: 1,
            width: '100%',
            backgroundColor: 'blue',
        });
    });
});
