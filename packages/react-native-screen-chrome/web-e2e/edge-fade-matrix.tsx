import React from 'react';
import { createRoot } from 'react-dom/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { EdgeFadeDemoScreen } from '../../react-native-screen-chrome-example/src/component/edge-fade-demo-screen';

const container = document.getElementById('root');

if (container !== null) {
    createRoot(container).render(
        <SafeAreaProvider>
            <EdgeFadeDemoScreen />
        </SafeAreaProvider>
    );
}
