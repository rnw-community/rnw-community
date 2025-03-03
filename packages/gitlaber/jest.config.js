module.exports = {
    ...require('../../get-jest.config.js')('gitlaber'),
    coverageThreshold: {
        global: {
            branches: 85,
        },
    },
};
