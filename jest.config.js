module.exports = {
    projects: ['packages/*/jest.config.js'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 94.5,
            branches: 85,
            functions: 93.5,
            lines: 94.7,
        },
    },
};
