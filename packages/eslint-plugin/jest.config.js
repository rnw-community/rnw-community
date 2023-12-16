module.exports = {
    ...require('../../get-jest.config.js')('eslint-plugin'),
    coverageThreshold: {
        global: {
            statements: 94.4,
            branches: 88.8,
            functions: 99.9,
            lines: 94.1,
        },
    },
};
