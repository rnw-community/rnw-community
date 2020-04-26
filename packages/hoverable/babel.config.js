const sharedBabelConfig = require('../shared/babel.config');

module.exports = {
    ...sharedBabelConfig,
    presets: [
        ...sharedBabelConfig.presets,
        'module:metro-react-native-babel-preset',
    ],
};
