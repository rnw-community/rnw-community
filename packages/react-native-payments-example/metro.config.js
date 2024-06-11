const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    resolver: {
        unstable_enableSymlinks: true,
    },
    watchFolders: [
        path.resolve(__dirname, '../../node_modules'),
        path.resolve(__dirname, '../../node_modules/@rnw-community/react-native-payments'),
        path.resolve(__dirname, '../../node_modules/@rnw-community/shared'),
        path.resolve(__dirname, '../../node_modules/@rnw-community/platform'),
    ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
