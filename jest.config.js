module.exports = {
    projects: ['packages/*/jest.config.js'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coveragePathIgnorePatterns: ['.mock.ts'],
    coverageThreshold: {
        global: {
            statements: 99.8,
            branches: 91,
            functions: 98,
            lines: 99.8,
        },
    },
};
