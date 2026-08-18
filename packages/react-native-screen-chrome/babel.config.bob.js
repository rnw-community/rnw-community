module.exports = {
    presets: ['react-native-builder-bob/babel-preset'],
    plugins: [['babel-plugin-react-compiler', { panicThreshold: 'all_errors', target: '18' }]],
};
