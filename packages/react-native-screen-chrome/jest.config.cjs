module.exports = {
    ...require('../../get-jest.config.js')('react-native-screen-chrome', '@react-native/jest-preset'),
    resolver: 'react-native-worklets/jest/resolver',
    setupFilesAfterEnv: ['<rootDir>/jest-setup.cjs'],
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-reanimated|react-native-worklets)/)',
    ],
};
