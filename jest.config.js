module.exports = {
    projects: ['packages/*/jest.config.js'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 98.1,
            branches: 81.5,
            functions: 95.4,
            lines: 100,
        },
    },
};
