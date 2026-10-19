import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableFreeze } from 'react-native-screens';

import { BottomFadeDemoScreen } from './bottom-fade-demo-screen';
import { ChromeDemoHomeScreen } from './chrome-demo-home-screen';
import { CollapsibleDemoScreen } from './collapsible-demo-screen';
import { FooterDemoScreen } from './footer-demo-screen';
import { KeyboardDemoScreen } from './keyboard-demo-screen';
import { SnapOffDemoScreen } from './snap-off-demo-screen';
import { StaticHeaderDemoScreen } from './static-header-demo-screen';
import { TabBarDemoScreen } from './tab-bar-demo-screen';
import { ThemeDemoScreen } from './theme-demo-screen';

import type { ChromeDemoStackParamList } from '../type/chrome-demo-stack-param-list.type';

enableFreeze(true);

const Stack = createNativeStackNavigator<ChromeDemoStackParamList>();

const Home = ({ navigation }: { readonly navigation: { navigate: (screen: string) => void } }) => (
    <ChromeDemoHomeScreen navigate={screen => void navigation.navigate(screen)} />
);

export const App = () => (
    <SafeAreaProvider>
        <KeyboardProvider>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ freezeOnBlur: true, headerShown: false }}>
                    <Stack.Screen component={Home} name="Home" />
                    <Stack.Screen component={CollapsibleDemoScreen} name="Collapsible" />
                    <Stack.Screen component={StaticHeaderDemoScreen} name="StaticHeader" />
                    <Stack.Screen component={FooterDemoScreen} name="Footer" />
                    <Stack.Screen component={SnapOffDemoScreen} name="SnapOff" />
                    <Stack.Screen component={BottomFadeDemoScreen} name="BottomFade" />
                    <Stack.Screen component={TabBarDemoScreen} name="TabBar" />
                    <Stack.Screen component={KeyboardDemoScreen} name="Keyboard" />
                    <Stack.Screen component={ThemeDemoScreen} name="Theme" />
                </Stack.Navigator>
            </NavigationContainer>
        </KeyboardProvider>
    </SafeAreaProvider>
);
