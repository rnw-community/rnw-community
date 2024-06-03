module.exports = {
    ...require('../../get-jest.config.js')('nestjs-enterprise'),
    coverageThreshold: {
        global: {
            branches: 85.7,
        },
    },
};
