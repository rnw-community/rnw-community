module.exports = {
    projects: ['packages/*/jest.config.js'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 97.3,
            branches: 83.1,
            functions: 93,
            lines: 100,
        },
    },
};
