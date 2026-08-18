module.exports = {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
        ['babel-plugin-react-compiler', { panicThreshold: 'all_errors', target: '18' }],
        'react-native-worklets/plugin',
    ],
};
