import { AppRegistry } from 'react-native';

import { App } from '@rnw-community/react-native-payments-example-lib';

import { name as appName } from './app.json';

console.log(App);

AppRegistry.registerComponent(appName, () => App);
