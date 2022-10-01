module.exports = {
    displayName: 'wdio',
    testRegex: './src/.*\\.spec\\.(tsx?)$',
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['.mock.ts'],
};
