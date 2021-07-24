module.exports = {
    projects: ['packages/*/jest.config.js'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 96.5,
            branches: 93.3,
            functions: 90,
            lines: 98.7,
        },
    },
};
