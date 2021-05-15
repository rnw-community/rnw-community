module.exports = {
    projects: ['packages/*/jest.config.js'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 100,
            branches: 94.23,
            functions: 100,
            lines: 100,
        },
    },
};
