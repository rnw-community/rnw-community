import React from 'react';

import { EdgeFade, ScreenChromeFrame, ScreenChromeProvider } from '@rnw-community/react-native-screen-chrome';

import { ChromeDemoCollapsibleHeader } from './chrome-demo-collapsible-header';
import { ChromeDemoList } from './chrome-demo-list';

const COLLAPSIBLE_DEMO_CONFIG = { snapToCollapse: true };

export const CollapsibleDemoScreen = () => (
    <ScreenChromeProvider config={COLLAPSIBLE_DEMO_CONFIG}>
        <ScreenChromeFrame>
            <ChromeDemoList testID="collapsible-demo-scroll" />
            <EdgeFade position="top" testID="collapsible-demo-top-fade" />
            <ChromeDemoCollapsibleHeader testIDPrefix="collapsible-demo" />
        </ScreenChromeFrame>
    </ScreenChromeProvider>
);
