module.exports = {
    projects: ['packages/*/jest.config.js'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 95.8,
            branches: 86.5,
            functions: 92.1,
            lines: 95.8,
        },
    },
};
