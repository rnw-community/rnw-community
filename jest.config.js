module.exports = {
    projects: ['packages/*/jest.config.js'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 97,
            branches: 86.5,
            functions: 93.5,
            lines: 97,
        },
    },
};
