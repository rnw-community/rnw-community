module.exports = {
    ...require('../../get-jest.config.js')('react-native-payments'),
    coverageThreshold: {
        global: {
            branches: 92,
            lines: 99.9,
            statements: 99.9,
            functions: 99.9,
        },
    },
};
