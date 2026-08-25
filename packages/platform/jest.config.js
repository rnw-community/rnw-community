module.exports = {
    ...require('../../get-jest.config.js')('platform', '@react-native/jest-preset', [
        '(jest-)?react-native',
        '@react-native(-community)?',
    ]),
};
