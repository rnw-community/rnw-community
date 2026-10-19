import React from 'react';

import { EdgeFade, ScreenChromeFrame, ScreenChromeProvider } from '@rnw-community/react-native-screen-chrome';

import { ChromeDemoCollapsibleHeader } from './chrome-demo-collapsible-header';
import { ChromeDemoList } from './chrome-demo-list';

const SNAP_OFF_DEMO_CONFIG = { snapToCollapse: false };

export const SnapOffDemoScreen = () => (
    <ScreenChromeProvider config={SNAP_OFF_DEMO_CONFIG}>
        <ScreenChromeFrame>
            <ChromeDemoList testID="snap-off-demo-scroll" />
            <EdgeFade position="top" testID="snap-off-demo-top-fade" />
            <ChromeDemoCollapsibleHeader testIDPrefix="snap-off-demo" />
        </ScreenChromeFrame>
    </ScreenChromeProvider>
);
