const resolveReanimatedJestResolver = () => {
    try {
        return require.resolve('react-native-reanimated/jest/resolver');
    } catch {
        return require.resolve('react-native-worklets/jest/resolver');
    }
};

module.exports = {
    ...require('../../get-jest.config.js')('react-native-screen-chrome', '@react-native/jest-preset', [
        '(jest-)?react-native',
        '@react-native(-community)?',
        'react-native-reanimated',
        'react-native-worklets',
    ]),
    collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}', '!<rootDir>/src/**/*.spec.{ts,tsx}', '!<rootDir>/src/**/*.d.ts'],
    resolver: resolveReanimatedJestResolver(),
    setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
};
