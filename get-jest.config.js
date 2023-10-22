module.exports = (packageName, preset) => ({
    testRegex: './src/.*\\.spec\\.(tsx?)$',
    testEnvironment: 'node',
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coveragePathIgnorePatterns: ['.mock.ts'],
    coverageThreshold: {
        global: {
            statements: 99.9,
            branches: 99.9,
            functions: 99.9,
            lines: 99.9,
        },
    },
    ...(packageName !== undefined && {
        preset,
        displayName: packageName,
    }),
});
