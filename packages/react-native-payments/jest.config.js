module.exports = {
    ...require('../../get-jest.config.js')('react-native-payments'),
    coverageThreshold: {
        global: {
            branches: 76.15,
        },
    },
};
