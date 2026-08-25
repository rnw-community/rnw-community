import React from 'react';
import { Text, View } from 'react-native';

import { CHROME_DEMO_STYLES as styles } from '../constant/chrome-demo-style';

import { ChromeDemoLink } from './chrome-demo-link';

export const ChromeDemoHomeScreen = ({ navigate }: { readonly navigate: (screen: string) => void }) => (
    <View style={styles.homeContainer}>
        <Text style={styles.homeTitle}>Screen chrome demos</Text>
        <ChromeDemoLink
            onPress={() => void navigate('Collapsible')}
            target="Collapsible header"
            testID="home-open-collapsible"
        />
        <ChromeDemoLink
            onPress={() => void navigate('StaticHeader')}
            target="Static header"
            testID="home-open-static-header"
        />
        <ChromeDemoLink onPress={() => void navigate('Footer')} target="Header and footer" testID="home-open-footer" />
    </View>
);
