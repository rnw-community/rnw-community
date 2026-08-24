module.exports = {
    ...require('../../get-jest.config.js')('react-native-collapsible-header', '@react-native/jest-preset', [
        '(jest-)?react-native',
        '@react-native(-community)?',
        'react-native-reanimated',
        'react-native-worklets',
    ]),
    collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}', '!<rootDir>/src/**/*.spec.{ts,tsx}', '!<rootDir>/src/**/*.d.ts'],
    resolver: 'react-native-worklets/jest/resolver',
    setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
};
