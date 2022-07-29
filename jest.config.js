module.exports = {
    projects: ['packages/*/jest.config.js'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 94.5,
            branches: 83,
            functions: 93.5,
            lines: 94,
        },
    },
};
