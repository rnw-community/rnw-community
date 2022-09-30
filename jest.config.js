module.exports = {
    projects: ['packages/*/jest.config.js'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 90.4,
            branches: 75,
            functions: 90.6,
            lines: 91.3,
        },
    },
};
