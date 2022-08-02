module.exports = {
    projects: ['packages/*/jest.config.js'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 98.6,
            branches: 87.3,
            functions: 95.3,
            lines: 98.4,
        },
    },
};
