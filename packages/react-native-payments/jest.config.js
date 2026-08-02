module.exports = {
    ...require('../../get-jest.config.js')('react-native-payments'),
    coverageThreshold: {
        global: {
            branches: 100,
            lines: 100,
            statements: 100,
            functions: 100,
        },
    },
};
