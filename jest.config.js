module.exports = {
    projects: ['packages/*/jest.config.js'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coveragePathIgnorePatterns: ['.mock.ts'],
    coverageThreshold: {
        global: {
            statements: 99.8,
            branches: 90.6,
            functions: 97.94,
            lines: 99.8,
        },
    },
};
