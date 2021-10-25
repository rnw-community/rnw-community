module.exports = {
    projects: ['packages/*/jest.config.js'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 97.9,
            branches: 86.6,
            functions: 96.2,
            lines: 99.4,
        },
    },
};
