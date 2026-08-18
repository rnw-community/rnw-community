import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { enableFreeze } from 'react-native-screens';

import { HeaderDemoDetailsScreen } from './header-demo-details-screen';
import { HeaderDemoHomeScreen } from './header-demo-home-screen';
import { SettingsDemoScreen } from './settings-demo-screen';

import type { HeaderDemoStackParamList } from '../type/header-demo-stack-param-list.type';

enableFreeze(true);

const Stack = createNativeStackNavigator<HeaderDemoStackParamList>();

export const App = () => (
    <NavigationContainer>
        <Stack.Navigator screenOptions={{ freezeOnBlur: true, headerShown: false }}>
            <Stack.Screen component={HeaderDemoHomeScreen} name="Home" />
            <Stack.Screen component={HeaderDemoDetailsScreen} name="Details" />
            <Stack.Screen component={SettingsDemoScreen} name="Settings" />
        </Stack.Navigator>
    </NavigationContainer>
);
