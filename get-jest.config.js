module.exports = (packageName, preset) => ({
    preset,
    testRegex: './src/.*\\.spec\\.(tsx?)$',
    testEnvironment: 'node',
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coveragePathIgnorePatterns: ['.mock.ts'],
    coverageThreshold: {
        global: {
            statements: 99.7,
            branches: 90.6,
            functions: 96.22,
            lines: 99.8,
        },
    },
    ...(packageName !== undefined && {
        displayName: packageName,
        coverageDirectory: `../../coverage/${packageName}`,
    }),
});
