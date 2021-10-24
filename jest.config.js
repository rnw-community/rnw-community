module.exports = {
    projects: ['packages/*/jest.config.js'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 96.0,
            branches: 79,
            functions: 92,
            lines: 100,
        },
    },
};
