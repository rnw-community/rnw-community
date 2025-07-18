module.exports = {
    ...require('../../get-jest.config.js')('nestjs-enterprise'),
    coverageThreshold: {
        global: {
            branches: 92.1,
            statements: 98,
            functions: 94.1,
            lines: 99.9,
        },
    },
};
