module.exports = {
    ...require('../../get-jest.config.js')('nestjs-enterprise'),
    coverageThreshold: {
        global: {
            branches: 88.8,
        },
    },
};
