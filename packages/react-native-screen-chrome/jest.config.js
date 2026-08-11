module.exports = {
    ...require('../../get-jest.config.js')('react-native-screen-chrome', '@react-native/jest-preset'),
    collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}', '!<rootDir>/src/**/*.spec.{ts,tsx}', '!<rootDir>/src/**/*.d.ts'],
    resolver: 'react-native-worklets/jest/resolver',
    setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-reanimated|react-native-worklets)/)',
    ],
};
