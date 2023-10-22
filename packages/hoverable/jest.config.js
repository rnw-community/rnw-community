const defaultConfig = require('../../get-jest.config.js')('hoverable', 'react-native');

module.exports = {
    ...defaultConfig,
    coverageThreshold: {
        global: {
            ...defaultConfig.coverageThreshold.global,
            branches: 93.1,
        },
    },
};
