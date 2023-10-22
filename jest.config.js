module.exports = {
    projects: ['packages/*'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coveragePathIgnorePatterns: ['.mock.ts'],
    coverageThreshold: {
        global: {
            statements: 99.7,
            branches: 90.6,
            functions: 96.24,
            lines: 99.8,
        },
    },
};
