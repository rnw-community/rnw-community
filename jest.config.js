module.exports = {
    projects: ['packages/*/jest.config.js'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 98.1,
            branches: 86.8,
            functions: 95.6,
            lines: 99.5,
        },
    },
};
