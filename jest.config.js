module.exports = {
    projects: ['packages/*/jest.config.js'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 96.5,
            branches: 86.5,
            functions: 93.5,
            lines: 96.1,
        },
    },
};
