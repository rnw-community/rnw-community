module.exports = {
    ...require('../../get-jest.config.js')('platform', '@react-native/jest-preset'),
    transformIgnorePatterns: [
        'node_modules/(?!\\.pnpm|((jest-)?react-native|@react-native(-community)?)/)',
        'node_modules/\\.pnpm/[^/]+/node_modules/(?!((jest-)?react-native|@react-native(-community)?)/)',
    ],
};
